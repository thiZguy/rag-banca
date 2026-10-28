import { readdir, readFile } from "node:fs/promises";
import type { Sql } from "postgres";

const CARPETA = new URL("../../db/migrations/", import.meta.url);

// Aplica en orden las migraciones SQL numeradas que aún no se aplicaron (ADR 0002).
export async function migrar(sql: Sql): Promise<string[]> {
  await sql`CREATE TABLE IF NOT EXISTS migraciones (nombre text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())`;
  const aplicadas = new Set((await sql<{ nombre: string }[]>`SELECT nombre FROM migraciones`).map((m) => m.nombre));
  const pendientes = (await readdir(CARPETA)).filter((f) => f.endsWith(".sql") && !aplicadas.has(f)).sort();
  for (const nombre of pendientes) {
    const contenido = await readFile(new URL(nombre, CARPETA), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(contenido);
      await tx`INSERT INTO migraciones (nombre) VALUES (${nombre})`;
    });
  }
  return pendientes;
}
