import { afterAll, beforeEach } from "vitest";
import { conectar } from "../src/db/conectar.js";
import { migrar } from "../src/db/migrar.js";

// Base separada de la de desarrollo; la crea el init de Docker Compose.
const url = process.env.TEST_DATABASE_URL ?? "postgres://rag:rag@localhost:5432/rag_test";

export function usarBaseDeTest() {
  const sql = conectar(url);
  const migracionesAplicadas = migrar(sql);
  beforeEach(async () => {
    await migracionesAplicadas;
    await sql`TRUNCATE documentos CASCADE`;
  });
  afterAll(() => sql.end());
  return sql;
}
