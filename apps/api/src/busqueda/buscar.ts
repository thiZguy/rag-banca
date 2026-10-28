import type { Sql } from "postgres";
import type { Embedder } from "../embeddings/embedder.js";
import { aVector } from "./repositorio.js";

export type Resultado = {
  posicion: number;
  puntaje: number;
  documentoId: string;
  titulo: string;
  fecha: string;
  seccion: string;
  ruta: string;
  paginaInicio: number;
  paginaFin: number;
  texto: string;
};

export class SinChunksDelModeloError extends Error {
  constructor(modelo: string) {
    super(`No hay Chunks embebidos con ${modelo}. Corre \`npm run ingest\` primero.`);
  }
}

export function crearBuscador(sql: Sql, embedder: Embedder) {
  return {
    async buscar(pregunta: string): Promise<Resultado[]> {
      const [{ hay }] = await sql<[{ hay: boolean }]>`SELECT EXISTS (SELECT 1 FROM chunks WHERE modelo = ${embedder.modelo}) AS hay`;
      if (!hay) throw new SinChunksDelModeloError(embedder.modelo);

      const [embedding] = await embedder.embeber([pregunta], "query");
      const vector = aVector(embedding!);
      // Búsqueda exacta por distancia coseno, sin índice (ver spec #1). Solo compara
      // contra vectores del mismo modelo: los de modelos distintos no son comparables.
      const filas = await sql<Omit<Resultado, "posicion">[]>`
        SELECT 1 - (c.embedding <=> ${vector}::vector) AS puntaje,
               d.id AS "documentoId", d.titulo, to_char(d.fecha, 'YYYY-MM-DD') AS fecha,
               c.seccion, c.ruta, c.pagina_inicio AS "paginaInicio", c.pagina_fin AS "paginaFin", c.texto
        FROM chunks c JOIN documentos d ON d.id = c.documento_id
        WHERE c.modelo = ${embedder.modelo}
        ORDER BY c.embedding <=> ${vector}::vector
        LIMIT 5`;
      return filas.map((f, i) => ({ ...f, posicion: i + 1 }));
    },
  };
}
