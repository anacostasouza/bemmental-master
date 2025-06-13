import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"; 
import Header from "../components/Header";
import type { UsuarioPsicologo, UsuarioPaciente } from "../types/Usuarios";
import type { Consulta } from "../types/Agenda";
import "../styles/agendarDetalhes.css";

export default function AgendarDetalhes() {
  const location = useLocation();
  const navigate = useNavigate();

  const { psicologo, paciente, consultaOriginalId } = (location.state || {}) as {
    psicologo: UsuarioPsicologo;
    paciente: UsuarioPaciente;
    consultaOriginalId?: string; 
  };

  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("");
  const [selectedHorario, setSelectedHorario] = useState<string>("");
  const [agendando, setAgendando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isRemarcando = !!consultaOriginalId; 

  useEffect(() => {
    if (!psicologo || !psicologo.usuarioID || !paciente || !paciente.usuarioID) {
      console.error("Dados incompletos de psicólogo ou paciente. Redirecionando.");
      alert("Erro ao carregar detalhes da consulta. Por favor, tente novamente na página anterior.");
      navigate("/marcar-consulta"); 
    }
  }, [psicologo, paciente, navigate]);

  if (!psicologo || !paciente) {
    return (
      <>
        <Header />
        <div className="agendar-detalhes-container">
          <p>Carregando detalhes do agendamento...</p>
        </div>
      </>
    );
  }

  const horariosDisponiveis = psicologo.agendaDisponibilidade?.find(
    (agenda) => agenda.diaSemana === selectedDay && agenda.periodo === selectedPeriodo
  )?.horarios || [];

  const handleConfirmarAgendamento = async () => {
    if (!selectedDay || !selectedPeriodo || !selectedHorario) {
      setError("Por favor, selecione o dia, período e horário para agendar.");
      return;
    }

    setAgendando(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date();

      const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const targetDayIndex = daysOfWeek.indexOf(selectedDay);

      if (targetDayIndex === -1 || selectedDay === "") {
        setError("Dia da semana selecionado é inválido.");
        setAgendando(false);
        return;
      }

      let dayDiff = targetDayIndex - today.getDay();
      if (dayDiff < 0) {
        dayDiff += 7;
      }

      const consultationDate = new Date(today);
      consultationDate.setDate(today.getDate() + dayDiff);

      const [hour, minute] = selectedHorario.split(":").map(Number);
      consultationDate.setHours(hour, minute, 0, 0);

      const now = new Date();
      if (
        consultationDate.getDate() === now.getDate() &&
        consultationDate.getMonth() === now.getMonth() &&
        consultationDate.getFullYear() === now.getFullYear() &&
        consultationDate < now
      ) {
        setError(
          "Não é possível agendar uma consulta em um horário que já passou hoje. Por favor, escolha outro horário ou dia."
        );
        setAgendando(false);
        return;
      }

      const dadosConsulta: Omit<Consulta, "id"> = {
        psicologoId: psicologo.usuarioID,
        pacienteId: paciente.usuarioID,
        data: consultationDate,
        horario: selectedHorario,
        diaSemana: selectedDay as Consulta["diaSemana"],
        periodo: selectedPeriodo as Consulta["periodo"],
        status: isRemarcando ? "remarcada" : "pendente", 
      };

      if (isRemarcando && consultaOriginalId) {
        const consultaRef = doc(db, "consultas", consultaOriginalId);
        await updateDoc(consultaRef, dadosConsulta); 
        setSuccess("Consulta remarcada com sucesso!");
        alert("Consulta remarcada com sucesso!");
        navigate("/minhas-consultas-paciente"); 
      } else {
        await addDoc(collection(db, "consultas"), dadosConsulta);
        setSuccess("Sua solicitação de consulta foi enviada com sucesso! O psicólogo precisa confirmar.");
        alert("Sua solicitação de consulta foi enviada com sucesso! O psicólogo precisa confirmar.");
        navigate("/minhas-consultas-paciente");
      }
    } catch (err: any) {
      console.error("Erro ao agendar/remarcar consulta:", err);
      setError("Não foi possível realizar a ação. Tente novamente mais tarde.");
    } finally {
      setAgendando(false);
    }
  };

  const diasDisponiveis = Array.from(
    new Set(
      psicologo.agendaDisponibilidade?.map((a) => a.diaSemana).filter((dia) => dia !== "") || []
    )
  );

  const periodosDisponiveis = Array.from(
    new Set(
      psicologo.agendaDisponibilidade
        ?.filter((a) => a.diaSemana === selectedDay)
        .map((a) => a.periodo)
        .filter((periodo) => periodo !== "") || []
    )
  );

  return (
    <>
      <Header />
      <div className="agendar-detalhes-container">
        <h1>{isRemarcando ? "Remarcar Consulta" : "Agendar Consulta"} com Dr(a). {psicologo.nome} {psicologo.sobrenome}</h1>
        <p>
          <strong>CRP:</strong> {psicologo.crp}
        </p>
        <p>
          <strong>Paciente:</strong> {paciente.nome} {paciente.sobrenome}
        </p>

        {isRemarcando && (
          <p className="remarcando-info">Você está remarcando uma consulta existente. Os detalhes da consulta anterior serão atualizados com os novos horários.</p>
        )}

        <div className="form-group">
          <label htmlFor="diaSemana">Selecione o Dia:</label>
          <select
            id="diaSemana"
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setSelectedPeriodo("");
              setSelectedHorario("");
            }}
          >
            <option value="">Selecione um dia</option>
            {diasDisponiveis.map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        {selectedDay && (
          <div className="form-group">
            <label htmlFor="periodo">Selecione o Período:</label>
            <select
              id="periodo"
              value={selectedPeriodo}
              onChange={(e) => {
                setSelectedPeriodo(e.target.value);
                setSelectedHorario("");
              }}
            >
              <option value="">Selecione um período</option>
              {periodosDisponiveis.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {periodo}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedPeriodo && (
          <div className="form-group">
            <label htmlFor="horario">Selecione o Horário:</label>
            <select
              id="horario"
              value={selectedHorario}
              onChange={(e) => setSelectedHorario(e.target.value)}
            >
              <option value="">Selecione um horário</option>
              {horariosDisponiveis.map((horario) => (
                <option key={horario} value={horario}>
                  {horario}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button onClick={handleConfirmarAgendamento} disabled={agendando}>
          {isRemarcando ? (agendando ? "Remarcando..." : "Confirmar Remarcação") : (agendando ? "Enviando Solicitação..." : "Solicitar Agendamento")}
        </button>
      </div>
    </>
  );
}