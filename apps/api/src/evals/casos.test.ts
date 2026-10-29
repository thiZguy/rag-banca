import { describe, expect, it } from "vitest";
import { parsearCasos } from "./casos.js";

const q03 = { id: "q03", pregunta: "¿fraude?", doc_esperado: "ley-20009", seccion_esperada: "Art. 7", debe_responder: true };
const q05 = { id: "q05", pregunta: "holis", doc_esperado: "", seccion_esperada: "", debe_responder: false };

describe("parsearCasos", () => {
  it("acepta casos que responden con fuente y casos que se abstienen sin fuente", () => {
    expect(parsearCasos([q03, q05])).toEqual([q03, q05]);
  });

  it("rechaza un caso que debe responder pero no dice dónde está la respuesta", () => {
    expect(() => parsearCasos([{ ...q03, doc_esperado: "" }])).toThrow(/q03/);
  });
});
