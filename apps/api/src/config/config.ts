import { config as cargarDotenv } from "dotenv";
import { z } from "zod";

cargarDotenv({ path: new URL("../../../../.env", import.meta.url), quiet: true });

const variables = {
  DATABASE_URL: z.url("debe ser una URL de Postgres, por ejemplo postgres://rag:rag@localhost:5432/rag"),
  VOYAGE_API_KEY: z.string().min(1, "está vacía; créala en https://dashboard.voyageai.com/"),
};

export type Config = { [K in keyof typeof variables]: z.infer<(typeof variables)[K]> };

// Cada comando pide solo las variables que usa. Falla al arrancar, con un mensaje por
// variable, en vez de en mitad de una ingesta.
export function cargarConfig<K extends keyof Config>(claves: K[], env: NodeJS.ProcessEnv = process.env): Pick<Config, K> {
  const config: Partial<Config> = {};
  const problemas: string[] = [];
  for (const clave of claves) {
    const resultado = variables[clave].safeParse(env[clave] ?? "");
    if (resultado.success) config[clave] = resultado.data;
    else problemas.push(`  - ${clave} ${resultado.error.issues[0]?.message}`);
  }
  if (problemas.length) {
    console.error(`Configuración inválida en .env:\n${problemas.join("\n")}`);
    process.exit(1);
  }
  return config as Pick<Config, K>;
}
