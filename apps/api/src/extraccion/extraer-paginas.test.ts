import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { extraerPaginas } from "./extraer-paginas.js";

const LEY_20009 = new URL("../../../../corpus/raw/ley-20009.pdf", import.meta.url);

describe("extraerPaginas", () => {
  it("devuelve el texto de cada página del PDF, numeradas desde 1", async () => {
    const paginas = await extraerPaginas(await readFile(LEY_20009));

    expect(paginas.map((p) => p.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(paginas[0]!.texto).toContain("Artículo 1.- Esta ley regula el régimen de responsabilidad");
    expect(paginas[1]!.texto).toContain("Artículo 2.- Los titulares o usuarios de medios de pago");
  });

  it("conserva una línea por renglón y la sangría con que empieza cada inciso", async () => {
    const [primera] = await extraerPaginas(await readFile(LEY_20009));

    expect(primera!.texto).toMatch(/^\s{3,}Artículo 1\.- Esta ley regula/m);
    expect(primera!.texto).toMatch(/^casos de extravío, hurto, robo o fraude de tarjetas de crédito/m);
  });
});
