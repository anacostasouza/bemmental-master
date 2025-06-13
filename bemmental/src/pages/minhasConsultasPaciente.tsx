import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  updateDoc, 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebaseConfig";
import type { UsuarioPaciente, UsuarioPsicologo } from "../types/Usuarios"; 
import type { Consulta } from "../types/Agenda";
import { useNavigate } from "react-router-dom"; 
import "../styles/minhasConsultasPaciente.css"; 

export default function MinhasConsultasPaciente() {
  const [paciente, setPaciente] = useState<UsuarioPaciente | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [psicologosMap, setPsicologosMap] = useState<Map<string, UsuarioPsicologo>>(new Map());

  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(true);

  const [errorPaciente, setErrorPaciente] = useState<string | null>(null);
  const [errorConsultas, setErrorConsultas] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.tipoUsuario === "Paciente") {
              setPaciente(userData as UsuarioPaciente);
              setErrorPaciente(null);
            } else {
              setPaciente(null);
              setErrorPaciente("Usuário logado não é um paciente. Tipo detectado: " + userData.tipoUsuario);
            }
          } else {
            setPaciente(null);
            setErrorPaciente("Seu perfil de paciente não foi encontrado no Firestore para UID: " + user.uid);
          }
        } catch (err: any) {
          console.error("Erro ao buscar paciente no Firestore:", err);
          setErrorPaciente("Não foi possível carregar o perfil do paciente. Tente novamente.");
        }
      } else {
        setPaciente(null);
        setErrorPaciente("Nenhum usuário logado. Por favor, faça login como paciente.");
      }
      setLoadingPaciente(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const carregarConsultasEPsicologos = async () => {
      if (!paciente || errorPaciente) {
        setLoadingConsultas(false);
        setConsultas([]);
        setPsicologosMap(new Map());
        return;
      }

      setLoadingConsultas(true);
      setErrorConsultas(null);
      try {
        const qConsultas = query(
          collection(db, "consultas"),
          where("pacienteId", "==", paciente.usuarioID),
          orderBy("data", "asc")
        );
        const snapshotConsultas = await getDocs(qConsultas);

        const listaConsultas: Consulta[] = [];
        snapshotConsultas.forEach((doc) => {
          const rawData = doc.data();
          if (rawData.data instanceof Timestamp) {
            const processedConsulta: Consulta = {
              id: doc.id,
              data: rawData.data.toDate(),
              diaSemana: rawData.diaSemana,
              periodo: rawData.periodo,
              horario: rawData.horario,
              psicologoId: rawData.psicologoId,
              pacienteId: rawData.pacienteId,
              status: rawData.status || 'pendente',
            };
            listaConsultas.push(processedConsulta);
          }
        });
        setConsultas(listaConsultas);

        const psicologoIds = Array.from(new Set(listaConsultas.map((c) => c.psicologoId)));
        if (psicologoIds.length > 0) {
          if (psicologoIds.length > 10) {
            console.warn("Número de psicólogos excedeu o limite de 10 para a query 'in'. Alguns dados podem não ser carregados.");
          }
          const qPsicologos = query(
            collection(db, "usuarios"),
            where("usuarioID", "in", psicologoIds),
            where("tipoUsuario", "==", "Psicologo")
          );
          const snapshotPsicologos = await getDocs(qPsicologos);

          const map = new Map<string, UsuarioPsicologo>();
          snapshotPsicologos.forEach((doc) => {
            map.set(doc.data().usuarioID, doc.data() as UsuarioPsicologo);
          });
          setPsicologosMap(map);
        } else {
          setPsicologosMap(new Map());
        }
      } catch (err: any) {
        console.error("Erro ao carregar consultas ou psicólogos no Firestore:", err);
        setErrorConsultas("Não foi possível carregar suas consultas. Tente novamente mais tarde.");
        setConsultas([]);
        setPsicologosMap(new Map());
      } finally {
        setLoadingConsultas(false);
      }
    };

    carregarConsultasEPsicologos();
  }, [paciente, errorPaciente]); 

  const handleRemarcarConsulta = (consulta: Consulta) => {
    if (!psicologosMap.has(consulta.psicologoId)) {
        alert("Dados do psicólogo não carregados. Tente novamente.");
        return;
    }
    navigate("/agendar-detalhes", {
      state: {
        psicologo: psicologosMap.get(consulta.psicologoId),
        paciente: paciente, 
        consultaOriginalId: consulta.id, 
      },
    });
  };

  const handleCancelarConsulta = async (consultaId: string) => {
    if (!paciente) {
      alert("Erro: Paciente não logado.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      const consultaRef = doc(db, "consultas", consultaId);
      await updateDoc(consultaRef, {
        status: "cancelada",
      });
      setConsultas((prevConsultas) =>
        prevConsultas.map((c) => (c.id === consultaId ? { ...c, status: "cancelada" } : c))
      );
      alert("Consulta cancelada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao cancelar consulta:", error);
      if (error.code === "permission-denied") {
        alert("Erro de permissão: Você não tem autorização para cancelar esta consulta. Verifique suas regras do Firestore.");
      } else {
        alert("Erro ao cancelar consulta. Tente novamente.");
      }
    }
  };

  if (loadingPaciente) {
    return (
      <>
        <Header />
        <div className="minhas-consultas-container">
          <p>Carregando perfil do paciente...</p>
        </div>
      </>
    );
  }

  if (!paciente || errorPaciente) {
    return (
      <>
        <Header />
        <div className="minhas-consultas-container">
          <h1>Minhas Consultas</h1>
          <p className="error-message">
            {errorPaciente || "Você precisa estar logado como paciente para acessar esta página."}
          </p>
          <p>Por favor, faça <a href="/login">login</a> ou <a href="/cadastro">cadastre-se</a> como paciente.</p>
        </div>
      </>
    );
  }

  const consultasAtivas = consultas.filter(c => c.status !== 'cancelada' && c.status !== 'realizada').sort((a, b) => a.data.getTime() - b.data.getTime());
  const consultasHistorico = consultas.filter(c => c.status === 'cancelada' || c.status === 'realizada').sort((a, b) => b.data.getTime() - a.data.getTime());


  return (
    <>
      <Header />
      <div className="minhas-consultas-container">
        <h1>Minhas Consultas</h1>
        {paciente && (
          <p className="paciente-info">Olá, {paciente.nome} {paciente.sobrenome}!</p>
        )}

        <hr />

        <div className="consultas-lista">
          <h2>Próximas e Pendentes</h2>
          {loadingConsultas ? (
            <p>Carregando suas consultas...</p>
          ) : errorConsultas ? (
            <p className="error-message">{errorConsultas}</p>
          ) : consultasAtivas.length === 0 ? (
            <p>Você não tem consultas futuras ou pendentes no momento.</p>
          ) : (
            <ul>
              {consultasAtivas.map((consulta) => {
                const psicologoInfo = psicologosMap.get(consulta.psicologoId);
                return (
                  <li key={consulta.id} className="consulta-card">
                    <h3>
                      Consulta com: {psicologoInfo ? `Dr(a). ${psicologoInfo.nome} ${psicologoInfo.sobrenome}` : 'Psicólogo desconhecido'}
                    </h3>
                    <p>
                      <strong>Data:</strong> {consulta.data.toLocaleDateString("pt-BR")}{" "}
                      {consulta.data.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p>
                      <strong>Dia da Semana:</strong> {consulta.diaSemana}
                    </p>
                    <p>
                      <strong>Período:</strong> {consulta.periodo}
                    </p>
                    <p>
                      <strong>Horário:</strong> {consulta.horario}
                    </p>
                    <p>
                      <strong>Status:</strong> {
                        consulta.status === 'pendente' ? 'Aguardando Confirmação do Psicólogo' :
                        consulta.status === 'agendada' ? 'Confirmada (Agendada)' :
                        consulta.status === 'confirmada' ? 'Confirmada' : 
                        consulta.status === 'remarcada' ? 'Remarcada (Aguardando Confirmação)' : 
                        consulta.status
                      }
                    </p>
                    <div className="consulta-actions">
                      {(consulta.status === 'pendente' || consulta.status === 'agendada' || consulta.status === 'remarcada') && (
                        <>
                          <button
                            className="btn-remarcar-consulta"
                            onClick={() => handleRemarcarConsulta(consulta)}
                          >
                            Remarcar Consulta
                          </button>
                          <button
                            className="btn-cancelar-consulta"
                            onClick={() => handleCancelarConsulta(consulta.id)}
                          >
                            Cancelar Consulta
                          </button>
                        </>
                      )}
                      <button className="btn-consulta-action">Ver Detalhes</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <hr />

        <div className="consultas-lista historico">
          <h2>Histórico de Consultas (Realizadas/Canceladas)</h2>
          {loadingConsultas ? (
            <p>Carregando histórico...</p>
          ) : consultasHistorico.length === 0 ? (
            <p>Você não tem histórico de consultas.</p>
          ) : (
            <ul>
              {consultasHistorico.map((consulta) => {
                const psicologoInfo = psicologosMap.get(consulta.psicologoId);
                return (
                  <li key={consulta.id} className="consulta-card historico-card">
                    <h3>
                      Consulta com: {psicologoInfo ? `Dr(a). ${psicologoInfo.nome} ${psicologoInfo.sobrenome}` : 'Psicólogo desconhecido'}
                    </h3>
                    <p>
                      <strong>Data:</strong> {consulta.data.toLocaleDateString("pt-BR")}{" "}
                      {consulta.data.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p>
                      <strong>Status:</strong> {
                        consulta.status === 'realizada' ? 'Realizada' :
                        consulta.status === 'cancelada' ? 'Cancelada' :
                        consulta.status
                      }
                    </p>
                    <button className="btn-consulta-action">Ver Detalhes</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}