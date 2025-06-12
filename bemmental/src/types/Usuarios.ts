export interface UsuarioBase {
  usuarioID: string;
  email: string;
  nome: string;
  sobrenome: string;
  tipoUsuario: 'Paciente' | 'Psicologo';
  isPsicologo: boolean;
  genero: string;           
  dataNascimento: string;   
}

export interface UsuarioPaciente extends UsuarioBase {
  tipoUsuario: 'Paciente';
  isPsicologo: false;
  cro?: null;
}

export interface UsuarioPsicologo extends UsuarioBase {
  tipoUsuario: 'Psicologo';
  isPsicologo: true;
  cro: string;
}

export type Usuario = UsuarioPaciente | UsuarioPsicologo;
