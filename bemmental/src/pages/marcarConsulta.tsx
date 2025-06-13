import React, { useState, useEffect } from "react";
import "../styles/marcarConsulta.css";
import Header from "../components/Header";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { type UsuarioPsicologo, type UsuarioPaciente, type AgendaDisponibilidade } from "../types/Usuarios";
import { useNavigate } from "react-router-dom";

export default function MarcarConsulta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [periodo, setPeriodo] = useState<"" | "Manhã" | "Tarde" | "Noite">("");
  const [dia, setDia] = useState<"" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo">("");
  const [psicologos, setPsicologos] = useState<UsuarioPsicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pacienteData, setPacienteData] = useState<UsuarioPaciente | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid); 
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.tipoUsuario === "Paciente") {
              setPacienteData(userData as UsuarioPaciente);
            } else {
              console.warn("Usuário logado não é um paciente. Tipo:", userData.tipoUsuario);
              setPacienteData(null); 
            }
          } else {
            console.warn("Dados do usuário logado não encontrados no Firestore para UID:", user.uid);
            setPacienteData(null);
          }
        } catch (err: any) {
          console.error("Erro ao buscar dados do usuário logado:", err);
          setPacienteData(null);
        }
      } else {
        setPacienteData(null); 
        console.log("Nenhum usuário logado.");
      }
    });

    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    if (!isAuthReady) {
      console.log("Autenticação não pronta, aguardando para buscar psicólogos...");
      return;
    }

    const fetchPsicologos = async () => {
      console.log("Buscando psicólogos...");
      try {
        setLoading(true);

        const q = query(
          collection(db, "usuarios"),
          where("tipoUsuario", "==", "Psicologo")

        );
        const querySnapshot = await getDocs(q);
        const psicologosData: UsuarioPsicologo[] = [];
        querySnapshot.forEach((documento) => {
          const userData = documento.data() as UsuarioPsicologo;
          psicologosData.push(userData);
        });
        setPsicologos(psicologosData);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar psicólogos:", err);
        if (err.code === "permission-denied") {
          setError("Você não tem permissão para ver os psicólogos. Verifique suas regras de segurança do Firestore.");
        } else {
          setError("Não foi possível carregar os psicólogos. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPsicologos();
  }, [isAuthReady]); 
  const handleAgendar = (psicologo: UsuarioPsicologo) => {
    if (!currentUser) {
      alert("Você precisa estar logado para agendar uma consulta.");
      return;
    }

    if (!pacienteData || pacienteData.tipoUsuario !== "Paciente") {
      alert("Seu perfil não está reconhecido como paciente. Por favor, verifique seu cadastro ou faça login como paciente.");
      return;
    }

    navigate(`/agendar/${psicologo.usuarioID}`, {
      state: {
        psicologo: psicologo,
        paciente: pacienteData,
      },
    });
  };

  const psicologosFiltrados = psicologos.filter((psicologo) => {
    const matchesSearch =
      psicologo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (psicologo.descricaoProfissional &&
        psicologo.descricaoProfissional.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPeriodo =
      periodo === "" ||
      (psicologo.agendaDisponibilidade &&
        psicologo.agendaDisponibilidade.some((agenda: AgendaDisponibilidade) => agenda.periodo === periodo));

    const matchesDia =
      dia === "" ||
      (psicologo.agendaDisponibilidade &&
        psicologo.agendaDisponibilidade.some((agenda: AgendaDisponibilidade) => agenda.diaSemana === dia));

    return matchesSearch && matchesPeriodo && matchesDia;
  });

  const periodosOptions: Array<"" | "Manhã" | "Tarde" | "Noite"> = ["", "Manhã", "Tarde", "Noite"];
  const diasOptions: Array<"" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"> = [
    "", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
  ];

  if (!isAuthReady) {
    return <p>Carregando informações de autenticação...</p>;
  }

  if (currentUser && !pacienteData) {
    return (
      <>
        <Header />
        <div className="consulta-container">
          <h1>Encontre seu psicólogo aqui!</h1>
          <p className="error-message">Seu perfil não está reconhecido como paciente. Usuários psicólogos não podem agendar consultas nesta página.</p>
          <p>Se você é um paciente, verifique seu cadastro. Se você é um psicólogo, esta página não é para agendamento de suas próprias consultas.</p>
        </div>
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Header />
        <div className="consulta-container">
          <h1>Encontre seu psicólogo aqui!</h1>
          <p className="error-message">Você precisa estar logado para visualizar e agendar consultas.</p>
          <p>Por favor, <a href="/login">faça login</a> ou <a href="/cadastro">cadastre-se</a> como paciente.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="consulta-container">
        <h1>Encontre seu psicólogo aqui!</h1>

        <input
          type="text"
          placeholder="Buscar por nome ou especialidade"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        <form className="consulta-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label>Período</label>
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value as "" | "Manhã" | "Tarde" | "Noite")}>
                {periodosOptions.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p === "" ? "Todos" : p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dia da semana</label>
              <select value={dia} onChange={(e) => setDia(e.target.value as "" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo")}>
                {diasOptions.map((d, idx) => (
                  <option key={idx} value={d}>
                    {d === "" ? "Todos" : d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="lista-psicologos">
          {loading && <p>Carregando psicólogos...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && psicologosFiltrados.length === 0 ? (
            <p>Nenhum psicólogo encontrado com esses filtros.</p>
          ) : (
            psicologosFiltrados.map((p) => (
              <div key={p.usuarioID} className="psicologo-card">
                <h3>{p.nome} {p.sobrenome}</h3>
                <p><strong>CRP:</strong> {p.crp}</p>
                {p.descricaoProfissional && <p><strong>Sobre:</strong> {p.descricaoProfissional}</p>}

                {p.agendaDisponibilidade && p.agendaDisponibilidade.length > 0 && (
                  <>
                    <p><strong>Disponibilidade:</strong></p>
                    <ul>
                      {p.agendaDisponibilidade.map((agenda, index) => (
                        <li key={index}>
                          {agenda.diaSemana} - {agenda.periodo} ({agenda.horarios.join(", ")})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button id="btn-agendar" onClick={() => handleAgendar(p)}>Agendar</button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}