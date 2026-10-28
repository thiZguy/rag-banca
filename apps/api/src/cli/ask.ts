import { crearBuscador, SinChunksDelModeloError } from "../busqueda/buscar.js";
import { cargarConfig } from "../config/config.js";
import { conectar } from "../db/conectar.js";
import { crearEmbedderVoyage } from "../embeddings/embedder-voyage.js";

const pregunta = process.argv.slice(2).join(" ").trim();
if (!pregunta) {
  console.error('Uso: npm run ask -- "pregunta"');
  process.exit(1);
}

const config = cargarConfig(["DATABASE_URL", "VOYAGE_API_KEY"]);
const sql = conectar(config.DATABASE_URL);

try {
  const resultados = await crearBuscador(sql, crearEmbedderVoyage(config.VOYAGE_API_KEY)).buscar(pregunta);
  for (const r of resultados) {
    const paginas = r.paginaInicio === r.paginaFin ? `p. ${r.paginaInicio}` : `pp. ${r.paginaInicio}-${r.paginaFin}`;
    console.log(`\n${r.posicion}. [${r.puntaje.toFixed(3)}] ${r.titulo} (${r.fecha}) · ${r.seccion} · ${paginas}`);
    console.log(`   ${r.ruta}`);
    console.log(`   ${extracto(r.texto)}`);
  }
} catch (error) {
  if (!(error instanceof SinChunksDelModeloError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}

function extracto(texto: string, largo = 300) {
  const plano = texto.replace(/\s+/g, " ");
  return plano.length > largo ? `${plano.slice(0, largo)}…` : plano;
}
