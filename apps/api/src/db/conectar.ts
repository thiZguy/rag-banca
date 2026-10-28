import postgres from "postgres";

// Silencia los NOTICE de Postgres (p. ej. "extension already exists") en la consola.
export const conectar = (url: string) => postgres(url, { onnotice: () => {} });
