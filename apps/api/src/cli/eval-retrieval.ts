import { crearBuscador, SinChunksDelModeloError, type Resultado } from "../busqueda/buscar.js";
import { cargarConfig } from "../config/config.js";
import { conectar } from "../db/conectar.js";
import { crearEmbedderVoyage } from "../embeddings/embedder-voyage.js";
import type { Embedder } from "../embeddings/embedder.js";
import { cargarCasos } from "../evals/casos.js";
import { calcularHit5, casosQueCuentan } from "../evals/hit-at-5.js";

const casos = await cargarCasos();
const config = cargarConfig(["DATABASE_URL", "VOYAGE_API_KEY"]);
const sql = conectar(config.DATABASE_URL);

try {
  const casosQueResponden = casosQueCuentan(casos);
  const resultados: Record<string, Resultado[]> = {};
  // Sin casos que cuenten no hay nada que embeber: Voyage rechaza una lista vacía.
  if (casosQueResponden.length > 0) {
    const embedder = await embeberDeUnaVez(crearEmbedderVoyage(config.VOYAGE_API_KEY), casosQueResponden.map((c) => c.pregunta));
    const buscador = crearBuscador(sql, embedder);
    for (const caso of casosQueResponden) resultados[caso.id] = await buscador.buscar(caso.pregunta);
  }

  const reporte = calcularHit5(casos, resultados);
  for (const r of reporte.porCaso) {
    const donde = r.acierto ? `posición ${r.posicion}` : "fuera del top 5";
    console.log(`${r.acierto ? "✓" : "✗"} ${r.id}  ${r.doc_esperado} · ${r.seccion_esperada}  ${donde}`);
  }
  const porcentaje = reporte.total ? Math.round((100 * reporte.aciertos) / reporte.total) : 0;
  console.log(`\nHit@5: ${reporte.aciertos}/${reporte.total} (${porcentaje}%) · ${reporte.excluidos} sin contar por debe_responder: false`);
} catch (error) {
  if (!(error instanceof SinChunksDelModeloError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}

// Voyage sin medio de pago permite 3 requests por minuto: embebemos todas las preguntas
// en una sola llamada y buscar recibe un Embedder que devuelve esos vectores.
async function embeberDeUnaVez(embedder: Embedder, preguntas: string[]): Promise<Embedder> {
  const vectores = new Map((await embedder.embeber(preguntas, "query")).map((v, i) => [preguntas[i]!, v]));
  return {
    modelo: embedder.modelo,
    async embeber(textos) {
      return textos.map((t) => {
        const vector = vectores.get(t);
        if (!vector) throw new Error(`"${t}" no estaba entre las preguntas embebidas`);
        return vector;
      });
    },
  };
}
