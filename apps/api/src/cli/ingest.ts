import { guardarDocumento } from "../busqueda/repositorio.js";
import { chunkDocumento, TIPOS_CON_ARTICULOS } from "../chunking/chunk-documento.js";
import { cargarConfig } from "../config/config.js";
import { cargarManifest, leerPdfDelCorpus } from "../corpus/manifest.js";
import { conectar } from "../db/conectar.js";
import { crearEmbedderVoyage } from "../embeddings/embedder-voyage.js";
import { extraerPaginas } from "../extraccion/extraer-paginas.js";

const config = cargarConfig(["DATABASE_URL", "VOYAGE_API_KEY"]);
const sql = conectar(config.DATABASE_URL);
const embedder = crearEmbedderVoyage(config.VOYAGE_API_KEY);

try {
  const manifest = await cargarManifest();
  console.log(`Corpus con Fecha de corte ${manifest.fechaDeCorte}: ${manifest.documentos.length} Documentos`);
  // Verifica todos los hashes antes de embeber: un PDF que no calza falla sin gastar en Voyage.
  const pdfs = await Promise.all(manifest.documentos.map(leerPdfDelCorpus));
  const aIngestar = manifest.documentos.filter((d) => TIPOS_CON_ARTICULOS.includes(d.tipo));
  const omitidos = manifest.documentos.filter((d) => !aIngestar.includes(d));
  if (omitidos.length > 0) console.log(`  Se omiten por ahora (sin reglas de Secciones): ${omitidos.map((d) => d.id).join(", ")}`);
  let total = 0;
  for (const documento of aIngestar) {
    const paginas = await extraerPaginas(pdfs[manifest.documentos.indexOf(documento)]!);
    const chunks = chunkDocumento(documento, paginas);
    const { archivo: _, ...guardado } = documento;
    await guardarDocumento(sql, embedder, guardado, chunks);
    total += chunks.length;
    console.log(`  ${documento.id}: ${paginas.length} páginas, ${chunks.length} Chunks`);
  }
  console.log(`Listo: ${total} Chunks embebidos con ${embedder.modelo}`);
} finally {
  await sql.end();
}
