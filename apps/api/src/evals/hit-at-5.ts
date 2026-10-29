import type { Resultado } from "../busqueda/buscar.js";
import type { CasoDeEval } from "./casos.js";

export type ResultadoDeCaso = Pick<CasoDeEval, "id" | "doc_esperado" | "seccion_esperada"> & {
  acierto: boolean;
  posicion: number | null;
};
export type ReporteHit5 = { aciertos: number; total: number; excluidos: number; porCaso: ResultadoDeCaso[] };

type Encontrado = Pick<Resultado, "documentoId" | "seccion">;

// Las preguntas que deben abstenerse no tienen fuente esperada, así que no cuentan para Hit@5.
export const casosQueCuentan = (casos: CasoDeEval[]) => casos.filter((c) => c.debe_responder);

// Acierto: algún Chunk del top 5 tiene el Documento y la Sección esperados.
export function calcularHit5(casos: CasoDeEval[], resultados: Record<string, Encontrado[]>): ReporteHit5 {
  const porCaso = casosQueCuentan(casos).map(({ id, doc_esperado, seccion_esperada }) => {
    const indice = (resultados[id] ?? [])
      .slice(0, 5)
      .findIndex((r) => r.documentoId === doc_esperado && r.seccion === seccion_esperada);
    return { id, doc_esperado, seccion_esperada, acierto: indice >= 0, posicion: indice >= 0 ? indice + 1 : null };
  });
  return {
    aciertos: porCaso.filter((c) => c.acierto).length,
    total: porCaso.length,
    excluidos: casos.length - porCaso.length,
    porCaso,
  };
}
