import type { UsuarioPaciente } from "./Usuarios";

export interface Paciente extends UsuarioPaciente {
  preferenciasAtendimento?: { 
    dia: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"; 
    periodo: "Manhã" | "Tarde" | "Noite";
  }[]; 
}