import { describe, expect, it } from "vitest";
import { usarBaseDeTest } from "../../test/base-de-datos.js";
import { crearEmbedderFalso } from "../embeddings/embedder-falso.js";
import type { Embedder } from "../embeddings/embedder.js";
import { crearBuscador, SinChunksDelModeloError } from "./buscar.js";
import type { Chunk } from "../chunking/chunk-documento.js";
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

function chunk(orden: number, texto: string): Chunk {
  const seccion = `Art. ${orden + 1}`;
  return { seccion, ruta: `Ley 20.009 > ${seccion}`, orden, paginaInicio: 1, paginaFin: 1, texto, textoEmbebido: texto };
}

const textos = [
  "el emisor bloquea la tarjeta de pago tras el aviso de fraude",
  "las penas por uso fraudulento de tarjetas",
  "plazo de reclamo de treinta días hábiles",
  "reporte semestral de usuarios afectados",
  "restitución de fondos dentro de cinco días hábiles",
  "monitoreo de operaciones por los comercios",
  "bloqueo de medios de pago inactivos por doce meses",
];

describe("buscar", () => {
  it("devuelve como máximo 5 Chunks, el más parecido a la pregunta primero, con su Documento y Sección", async () => {
    await guardarDocumento(sql, embedder, ley, textos.map((t, i) => chunk(i, t)));

    const resultados = await crearBuscador(sql, embedder).buscar("¿qué plazo tengo para el reclamo?");

    expect(resultados).toHaveLength(5);
    expect(resultados[0]).toMatchObject({
      posicion: 1,
      documentoId: "ley-20009",
      titulo: "Ley 20.009",
      fecha: "2024-05-30",
      seccion: "Art. 3",
      ruta: "Ley 20.009 > Art. 3",
      texto: "plazo de reclamo de treinta días hábiles",
    });
    const puntajes = resultados.map((r) => r.puntaje);
    expect(puntajes).toEqual([...puntajes].sort((a, b) => b - a));
  });

  it("ignora los Chunks embebidos con otro modelo", async () => {
    await guardarDocumento(sql, crearEmbedderFalso("otro-modelo"), ley, [chunk(0, "plazo de reclamo")]);
    await guardarDocumento(sql, embedder, { ...ley, id: "ley-19496" }, [chunk(0, "derechos del consumidor")]);

    const resultados = await crearBuscador(sql, embedder).buscar("plazo de reclamo");

    expect(resultados.map((r) => r.documentoId)).toEqual(["ley-19496"]);
  });

  it("al volver a guardar un Documento reemplaza todos sus Chunks anteriores", async () => {
    await guardarDocumento(sql, embedder, ley, [chunk(0, "plazo de reclamo"), chunk(1, "bloqueo de tarjeta")]);
    await guardarDocumento(sql, embedder, ley, [chunk(0, "texto nuevo del artículo")]);

    const resultados = await crearBuscador(sql, embedder).buscar("plazo de reclamo");

    expect(resultados.map((r) => r.texto)).toEqual(["texto nuevo del artículo"]);
  });

  it("si falla a mitad del reemplazo, el Documento conserva sus Chunks anteriores", async () => {
    await guardarDocumento(sql, embedder, ley, [chunk(0, "plazo de reclamo")]);
    // El segundo vector tiene una dimensión que la columna rechaza, así que el INSERT falla en medio.
    const embedderRoto: Embedder = { ...embedder, embeber: async (textos) => textos.map((_, i) => new Array(i === 0 ? 1024 : 3).fill(0.1)) };

    await expect(guardarDocumento(sql, embedderRoto, ley, [chunk(0, "nuevo uno"), chunk(1, "nuevo dos")])).rejects.toThrow();

    const resultados = await crearBuscador(sql, embedder).buscar("plazo de reclamo");
    expect(resultados.map((r) => r.texto)).toEqual(["plazo de reclamo"]);
  });

  it("avisa cuando no hay Chunks del modelo actual", async () => {
    await expect(crearBuscador(sql, embedder).buscar("plazo de reclamo")).rejects.toBeInstanceOf(SinChunksDelModeloError);
  });
});
