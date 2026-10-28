import type { Sql } from "postgres";
import type { Chunk } from "../chunking/chunk-documento.js";
import type { DocumentoDelManifest } from "../corpus/manifest.js";
import type { Embedder } from "../embeddings/embedder.js";

export type DocumentoAGuardar = Omit<DocumentoDelManifest, "archivo">;

// pgvector recibe los vectores como texto "[0.1,0.2,...]".
export const aVector = (embedding: number[]) => `[${embedding.join(",")}]`;

// Embebe antes de abrir la transacción: si la API falla, la base queda como estaba.
// Dentro de la transacción reemplaza todos los Chunks del Documento de una vez.
export async function guardarDocumento(sql: Sql, embedder: Embedder, documento: DocumentoAGuardar, chunks: Chunk[]) {
  const embeddings = await embedder.embeber(chunks.map((c) => c.textoEmbebido), "document");
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO documentos ${tx(documento)}
      ON CONFLICT (id) DO UPDATE SET
        titulo = excluded.titulo, emisor = excluded.emisor, tipo = excluded.tipo,
        fecha = excluded.fecha, url = excluded.url, hash = excluded.hash`;
    await tx`DELETE FROM chunks WHERE documento_id = ${documento.id}`;
    for (const [i, c] of chunks.entries()) {
      await tx`
        INSERT INTO chunks (documento_id, seccion, ruta, pagina_inicio, pagina_fin, orden, texto, texto_embebido, caracteres, modelo, embedding)
        VALUES (${documento.id}, ${c.seccion}, ${c.ruta}, ${c.paginaInicio}, ${c.paginaFin}, ${c.orden}, ${c.texto},
                ${c.textoEmbebido}, ${c.texto.length}, ${embedder.modelo}, ${aVector(embeddings[i]!)}::vector)`;
    }
  });
}
