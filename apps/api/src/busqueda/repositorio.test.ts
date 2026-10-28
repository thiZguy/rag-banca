import { describe, expect, it } from "vitest";
import { usarBaseDeTest } from "../../test/base-de-datos.js";
import type { Chunk } from "../chunking/chunk-documento.js";
import { crearEmbedderFalso } from "../embeddings/embedder-falso.js";
import { crearBuscador } from "./buscar.js";
import { guardarDocumento, type DocumentoAGuardar } from "./repositorio.js";

const sql = usarBaseDeTest();
const embedder = crearEmbedderFalso();

const ley: DocumentoAGuardar = {
  id: "ley-20009",
  titulo: "Ley 20.009",
  emisor: "Congreso",
  tipo: "ley",
  fecha: "2024-05-30",
  url: "https://www.bcn.cl/leychile/navegar?idNorma=236736",
  hash: "abc",
};

const articulo1: Chunk = {
  seccion: "Art. 1",
  ruta: "Ley 20.009 > Art. 1",
  orden: 0,
  paginaInicio: 1,
  paginaFin: 1,
  texto: "plazo de reclamo de treinta días hábiles",
  textoEmbebido: "plazo de reclamo de treinta días hábiles",
};

describe("guardarDocumento", () => {
  it("rechaza un Documento sin Chunks y deja intactos los que ya tenía", async () => {
    await guardarDocumento(sql, embedder, ley, [articulo1]);

    await expect(guardarDocumento(sql, embedder, ley, [])).rejects.toThrow(/ley-20009 quedó sin Chunks/);

    const resultados = await crearBuscador(sql, embedder).buscar("plazo de reclamo");
    expect(resultados.map((r) => r.seccion)).toEqual(["Art. 1"]);
  });
});
