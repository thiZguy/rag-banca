import { describe, expect, it } from "vitest";
import { calcularHit5 } from "./hit-at-5.js";
import type { CasoDeEval } from "./casos.js";

function caso(id: string, doc_esperado: string, seccion_esperada: string): CasoDeEval {
  return { id, pregunta: `pregunta ${id}`, doc_esperado, seccion_esperada, debe_responder: true };
}

const top = (...pares: [string, string][]) => pares.map(([documentoId, seccion]) => ({ documentoId, seccion }));

describe("calcularHit5", () => {
  it("acierta cuando el Chunk esperado está en el top 5 y reporta su posición", () => {
    const reporte = calcularHit5([caso("q03", "ley-20009", "Art. 7")], {
      q03: top(["ley-20009", "Art. 5"], ["ley-20009", "Art. 7"], ["ley-21521", "Art. 7"]),
    });

    expect(reporte).toEqual({
      aciertos: 1,
      total: 1,
      excluidos: 0,
      porCaso: [{ id: "q03", doc_esperado: "ley-20009", seccion_esperada: "Art. 7", acierto: true, posicion: 2 }],
    });
  });

  it("falla si solo coincide el Documento o solo la Sección", () => {
    const reporte = calcularHit5([caso("q03", "ley-20009", "Art. 7")], {
      q03: top(["ley-20009", "Art. 5"], ["ley-21521", "Art. 7"]),
    });

    expect(reporte.porCaso).toEqual([{ id: "q03", doc_esperado: "ley-20009", seccion_esperada: "Art. 7", acierto: false, posicion: null }]);
  });

  it("no cuenta las preguntas que deben abstenerse", () => {
    const holis: CasoDeEval = { id: "q05", pregunta: "holis", doc_esperado: "", seccion_esperada: "", debe_responder: false };

    const reporte = calcularHit5([caso("q03", "ley-20009", "Art. 7"), holis], {
      q03: top(["ley-20009", "Art. 7"]),
      q05: top(["ley-20009", "Art. 1"]),
    });

    expect(reporte).toMatchObject({ aciertos: 1, total: 1, excluidos: 1 });
    expect(reporte.porCaso.map((c) => c.id)).toEqual(["q03"]);
  });
});
