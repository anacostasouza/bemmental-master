export interface AgendaDisponibilidade {
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo" | ""; 
  periodo: "Manhã" | "Tarde" | "Noite" | ""; 
  horarios: string[];
}

export interface UsuarioBase {
  usuarioID: string;
  email: string;
  nome: string;
  sobrenome: string;
  genero: string; 
  dataNascimento: string; 
  telefone?: string;
  endereco?: string;
}

export interface UsuarioPaciente extends UsuarioBase {
  tipoUsuario: 'Paciente';
  isPsicologo: false;
  crp?: undefined; 
  historicoMedico?: string;
}

export interface UsuarioPsicologo extends UsuarioBase {
  tipoUsuario: 'Psicologo';
  isPsicologo: true;
  crp: string; 
  descricaoProfissional?: string;
  agendaDisponibilidade?: AgendaDisponibilidade[];
}


export type Usuario = UsuarioPaciente | UsuarioPsicologo;