import type { ConsultaFiltro, Consulta } from "../types/Consulta";

export function filtrarConsultas(
  consultas: Consulta[],
  filtros: ConsultaFiltro
): Consulta[] {
  const { periodo, diaSemana } = filtros;
  if (!periodo || !diaSemana) return [];

  return consultas.filter(
    (c) =>
      c.periodo.toLowerCase() === periodo.toLowerCase() &&
      c.diaSemana.toLowerCase() === diaSemana.toLowerCase()
  );
}
