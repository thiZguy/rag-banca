import { cargarConfig } from "../config/config.js";
import { conectar } from "./conectar.js";
import { migrar } from "./migrar.js";

const sql = conectar(cargarConfig(["DATABASE_URL"]).DATABASE_URL);
try {
  const aplicadas = await migrar(sql);
  console.log(aplicadas.length ? `Migraciones aplicadas: ${aplicadas.join(", ")}` : "Sin migraciones pendientes");
} finally {
  await sql.end();
}
