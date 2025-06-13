export type ConsultaFiltro = {
  diaSemana: "" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"; 
  periodo: "" | "Manhã" | "Tarde" | "Noite"; 
};

export type Consulta = {
  id: string;
  pacienteId: string;
  psicologoId: string;
  data: Date;
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" ; 
  periodo: "Manhã" | "Tarde" | "Noite";
  horario: string;
  status: 'agendada' | 'pendente' | 'confirmada' | 'realizada' | 'cancelada' | 'remarcada'; 
};