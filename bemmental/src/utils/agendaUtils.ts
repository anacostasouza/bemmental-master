import type { FiltrosAgenda } from "../types/Agenda";
import type { UsuarioPaciente } from "../types/Usuarios";

export function filtrarPacientesAgenda(
  pacientes: UsuarioPaciente[],
  filtros: FiltrosAgenda
): UsuarioPaciente[] {
  const { periodo, diaSemana } = filtros;
  if (!periodo || !diaSemana) return [];
  
  return pacientes.filter(
    (p) =>
      (p as any).preferenciasAtendimento?.some(
        (pref: any) =>
          pref.periodo === periodo && pref.diaSemana === diaSemana
      )
  );
}
