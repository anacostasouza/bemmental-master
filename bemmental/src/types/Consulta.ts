export interface ConsultaFiltro {
  periodo: "Manhã" | "Tarde" | "Noite" | "";
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "";
}

export interface Consulta {
  id: string | number;
  pacienteId: string | number;
  psicologoId: string | number;
  data: Date;
  periodo: "Manhã" | "Tarde" | "Noite";
  diaSemana: string;
}
