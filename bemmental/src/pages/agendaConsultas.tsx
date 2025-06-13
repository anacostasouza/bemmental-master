import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { collection, getDocs, query, where, orderBy, Timestamp, doc, getDoc, updateDoc, } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebaseConfig";
import type { UsuarioPaciente, UsuarioPsicologo } from "../types/Usuarios";
import type { ConsultaFiltro, Consulta } from "../types/Agenda";
import { useNavigate } from "react-router-dom"; 
import "../styles/agendaConsultas.css";

export default function AgendaConsultas() {
  const [psicologo, setPsicologo] = useState<UsuarioPsicologo | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientesMap, setPacientesMap] = useState<Map<string, UsuarioPaciente>>(new Map());
  const [filtros, setFiltros] = useState<ConsultaFiltro>({ diaSemana: "", periodo: "" });

  const [loadingPsicologo, setLoadingPsicologo] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(true);

  const [errorPsicologo, setErrorPsicologo] = useState<string | null>(null);
  const [errorConsultas, setErrorConsultas] = useState<string | null>(null);

  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed. User:", user);
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Dados do usuário logado do Firestore:", userData);
            if (userData.tipoUsuario === "Psicologo") {
              setPsicologo(userData as UsuarioPsicologo);
              setErrorPsicologo(null);
              console.log("Psicólogo logado e perfil encontrado:", userData.nome);
            } else {
              setPsicologo(null);
              setErrorPsicologo("Usuário logado não é um psicólogo. Tipo detectado: " + userData.tipoUsuario);
              console.warn("Usuário não é psicólogo:", userData.tipoUsuario);
            }
          } else {
            setPsicologo(null);
            setErrorPsicologo("Seu perfil de psicólogo não foi encontrado no Firestore para UID: " + user.uid);
            console.warn("Perfil de usuário não encontrado para UID:", user.uid);
          }
        } catch (err: any) {
          console.error("Erro ao buscar psicólogo no Firestore:", err);
          setErrorPsicologo("Não foi possível carregar o perfil do psicólogo. Tente novamente.");
        }
      } else {
        setPsicologo(null);
        setErrorPsicologo("Nenhum usuário logado. Por favor, faça login como psicólogo.");
        console.log("Nenhum usuário autenticado.");
      }
      setLoadingPsicologo(false);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const carregarConsultasEPacientes = async () => {
      console.log("Tentando carregar consultas. Psicólogo:", psicologo);
      if (!psicologo || errorPsicologo) {
        setLoadingConsultas(false);
        setConsultas([]);
        setPacientesMap(new Map());
        console.log("Psicólogo não definido ou com erro, abortando carga de consultas.");
        return;
      }

      setLoadingConsultas(true);
      setErrorConsultas(null);
      try {
        const qConsultas = query(
          collection(db, "consultas"),
          where("psicologoId", "==", psicologo.usuarioID),
          orderBy("data", "asc")
        );
        console.log("Query de consultas:", qConsultas);
        const snapshotConsultas = await getDocs(qConsultas);
        console.log("Snapshot de consultas recebido. Docs:", snapshotConsultas.docs.length);

        const listaConsultas: Consulta[] = [];
        snapshotConsultas.forEach((doc) => {
          const rawData = doc.data();
          console.log("Processando documento de consulta:", doc.id, rawData);

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
          } else {
            console.warn("Campo 'data' não é um Timestamp válido ou está faltando para a consulta:", doc.id, rawData.data);
          }
        });
        setConsultas(listaConsultas);
        console.log("Consultas processadas e setadas:", listaConsultas.length);

        const pacienteIds = Array.from(new Set(listaConsultas.map((c) => c.pacienteId)));
        console.log("IDs de pacientes para buscar:", pacienteIds);

        if (pacienteIds.length > 0) {
          if (pacienteIds.length > 10) {
             console.warn("Número de pacientes excedeu o limite de 10 para a query 'in'. Alguns pacientes podem não ser carregados.");
          }
          const qPacientes = query(
            collection(db, "usuarios"),
            where("usuarioID", "in", pacienteIds),
            where("tipoUsuario", "==", "Paciente")
          );
          console.log("Query de pacientes:", qPacientes);
          const snapshotPacientes = await getDocs(qPacientes);
          console.log("Snapshot de pacientes recebido. Docs:", snapshotPacientes.docs.length);

          const map = new Map<string, UsuarioPaciente>();
          snapshotPacientes.forEach((doc) => {
            map.set(doc.data().usuarioID, doc.data() as UsuarioPaciente);
          });
          setPacientesMap(map);
          console.log("Mapa de pacientes setado:", map.size);
        } else {
          setPacientesMap(new Map());
          console.log("Nenhum paciente para buscar.");
        }
      } catch (err: any) {
        console.error("Erro ao carregar consultas ou pacientes no Firestore:", err);
        if (err.code === "permission-denied") {
          setErrorConsultas("Você não tem permissão para ver suas consultas ou dados de pacientes. Verifique as regras de segurança do Firestore.");
        } else {
          setErrorConsultas("Não foi possível carregar as consultas ou os dados dos pacientes. Tente novamente mais tarde.");
        }
        setConsultas([]);
        setPacientesMap(new Map());
      } finally {
        setLoadingConsultas(false);
      }
    };

    carregarConsultasEPacientes();
  }, [psicologo, errorPsicologo]);

  const handleConfirmarConsulta = async (consultaId: string) => {
    if (!psicologo) {
      alert("Erro: Psicólogo não logado.");
      return;
    }
    try {
      const consultaRef = doc(db, "consultas", consultaId);
      await updateDoc(consultaRef, {
        status: "agendada"
      });
      setConsultas(prevConsultas =>
        prevConsultas.map(c =>
          c.id === consultaId ? { ...c, status: "agendada" } : c
        )
      );
      alert("Consulta confirmada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao confirmar consulta:", error);
      if (error.code === "permission-denied") {
        alert("Erro de permissão: Você não tem autorização para confirmar esta consulta. Verifique suas regras do Firestore.");
      } else {
        alert("Erro ao confirmar consulta. Tente novamente.");
      }
    }
  };

  const handleCancelarConsulta = async (consultaId: string) => {
    if (!psicologo) {
      alert("Erro: Psicólogo não logado.");
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
      setConsultas(prevConsultas =>
        prevConsultas.map(c =>
          c.id === consultaId ? { ...c, status: "cancelada" } : c
        )
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

  const handleRemarcarConsultaPsicologo = (consulta: Consulta) => {
    if (!psicologo) {
        alert("Erro: Psicólogo não logado.");
        return;
    }
    const pacienteInfo = pacientesMap.get(consulta.pacienteId);
    if (!pacienteInfo) {
        alert("Dados do paciente não carregados. Tente novamente.");
        return;
    }

    navigate("/agendar-detalhes", {
      state: {
        psicologo: psicologo, 
        paciente: pacienteInfo, // O paciente da consulta
        consultaOriginalId: consulta.id, // ID da consulta a ser remarcada
      },
    });
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    const matchesDia = filtros.diaSemana === "" || consulta.diaSemana === filtros.diaSemana;
    const matchesPeriodo = filtros.periodo === "" || consulta.periodo === filtros.periodo;

    const consultaDate = consulta.data instanceof Date ? consulta.data : new Date(consulta.data);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const consultaDateOnly = new Date(consultaDate);
    consultaDateOnly.setHours(0, 0, 0, 0);

    const isFutureOrTodayConsulta = consultaDateOnly >= today;

    const isNotCancelled = consulta.status !== 'cancelada';
    const isNotRealizada = consulta.status !== 'realizada'; 

    console.log(`Consulta ${consulta.id}: Data ${consulta.data.toLocaleDateString()} ${consulta.data.toLocaleTimeString()}, Dia ${consulta.diaSemana}, Período ${consulta.periodo}, Filtrada por Dia: ${matchesDia}, Filtrada por Período: ${matchesPeriodo}, É Futura/Hoje: ${isFutureOrTodayConsulta}, Não Cancelada: ${isNotCancelled}, Não Realizada: ${isNotRealizada}. Resultado Final: ${matchesDia && matchesPeriodo && isFutureOrTodayConsulta && isNotCancelled && isNotRealizada}`);

    return matchesDia && matchesPeriodo && isFutureOrTodayConsulta && isNotCancelled && isNotRealizada;
  });

  const diasOptions: Array<ConsultaFiltro["diaSemana"]> = [
    "", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];
  const periodosOptions: Array<ConsultaFiltro["periodo"]> = [
    "", "Manhã", "Tarde", "Noite"
  ];

  if (loadingPsicologo) {
    return (
      <>
        <Header />
        <div className="agenda-container">
          <p>Carregando perfil do psicólogo...</p>
        </div>
      </>
    );
  }

  if (!psicologo || errorPsicologo) {
    return (
      <>
        <Header />
        <div className="agenda-container">
          <h1>Minha Agenda de Consultas</h1>
          <p className="error-message">
            {errorPsicologo || "Você precisa estar logado como psicólogo para acessar esta página."}
          </p>
          <p>Por favor, faça <a href="/login">login</a> ou <a href="/cadastro">cadastre-se</a> como psicólogo.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="agenda-container">
        <h1>Minha Agenda de Consultas</h1>
        {psicologo && (
          <p className="psicologo-info">Olá, Dr(a). {psicologo.nome} {psicologo.sobrenome} (CRP: {psicologo.crp})</p>
        )}

        <form className="agenda-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="diaSemana">Dia da Semana</label>
            <select
              id="diaSemana"
              value={filtros.diaSemana}
              onChange={(e) =>
                setFiltros({ ...filtros, diaSemana: e.target.value as ConsultaFiltro["diaSemana"] })
              }
            >
              {diasOptions.map((diaOpt) => (
                <option key={diaOpt} value={diaOpt}>
                  {diaOpt === "" ? "Todos os dias" : diaOpt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="periodo">Período</label>
            <select
              id="periodo"
              value={filtros.periodo}
              onChange={(e) =>
                setFiltros({ ...filtros, periodo: e.target.value as ConsultaFiltro["periodo"] })
              }
            >
              {periodosOptions.map((periodoOpt) => (
                <option key={periodoOpt} value={periodoOpt}>
                  {periodoOpt === "" ? "Todos os períodos" : periodoOpt}
                </option>
              ))}
            </select>
          </div>
        </form>

        <hr />

        <div className="consultas-lista">
          <h2>Próximas Consultas Agendadas</h2>
          {loadingConsultas ? (
            <p>Carregando suas consultas...</p>
          ) : errorConsultas ? (
            <p className="error-message">{errorConsultas}</p>
          ) : consultasFiltradas.length === 0 ? (
            <p>Nenhuma consulta futura encontrada para os filtros selecionados.</p>
          ) : (
            <ul>
              {consultasFiltradas.map((consulta) => {
                const paciente = pacientesMap.get(consulta.pacienteId);
                return (
                  <li key={consulta.id} className="consulta-card">
                    <h3>Consulta com: {paciente ? `${paciente.nome} ${paciente.sobrenome}` : 'Paciente desconhecido (ID: ' + consulta.pacienteId + ')'}</h3>
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

                        consulta.status === 'pendente' ? 'Aguardando Confirmação' :
                        consulta.status === 'agendada' ? 'Agendada' :
                        consulta.status === 'confirmada' ? 'Confirmada' :
                        consulta.status === 'realizada' ? 'Realizada' :
                        consulta.status === 'cancelada' ? 'Cancelada' :
                        consulta.status === 'remarcada' ? 'Remarcada' : 
                        consulta.status
                      }
                    </p>

                    <div className="consulta-actions">
                      {consulta.status === "pendente" && (
                        <button
                          className="btn-confirmar-consulta"
                          onClick={() => handleConfirmarConsulta(consulta.id)}
                        >
                          Confirmar Consulta
                        </button>
                      )}

                      {(consulta.status !== "cancelada" && consulta.status !== "realizada") && (
                         <button
                           className="btn-remarcar-consulta"
                           onClick={() => handleRemarcarConsultaPsicologo(consulta)}
                         >
                           Remarcar Consulta
                         </button>
                      )}

                      {(consulta.status !== "cancelada" && consulta.status !== "realizada") && (
                         <button
                           className="btn-cancelar-consulta"
                           onClick={() => handleCancelarConsulta(consulta.id)}
                         >
                           Cancelar Consulta
                         </button>
                      )}
                      <button className="btn-consulta-action">Ver Detalhes</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {psicologo?.agendaDisponibilidade && psicologo.agendaDisponibilidade.length > 0 && (
          <>
            <hr />
            <div className="minha-disponibilidade">
              <h2>Minha Disponibilidade Cadastrada</h2>
              <ul>
                {psicologo.agendaDisponibilidade.map((disp, index) => (
                  <li key={index}>
                    <strong>{disp.diaSemana} - {disp.periodo}:</strong> {disp.horarios.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {psicologo && (!psicologo.agendaDisponibilidade || psicologo.agendaDisponibilidade.length === 0) && (
            <>
                <hr />
                <div className="minha-disponibilidade">
                    <h2>Minha Disponibilidade Cadastrada</h2>
                    <p>Você ainda não cadastrou sua disponibilidade. Utilize a seção de perfil para adicionar horários.</p>
                </div>
            </>
        )}
      </div>
    </>
  );
}