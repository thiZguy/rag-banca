import { readFile } from "node:fs/promises";
import { z } from "zod";

const ARCHIVO_DE_CASOS = new URL("../../../../evals/questions.json", import.meta.url);

const esquema = z.array(
  z
    .object({
      id: z.string().min(1),
      pregunta: z.string().min(1),
      doc_esperado: z.string(),
      seccion_esperada: z.string(),
      debe_responder: z.boolean(),
    })
    // Un caso que debe responder sin fuente esperada sumaría un fallo que nada puede arreglar.
    .superRefine((c, ctx) => {
      if (c.debe_responder && (!c.doc_esperado || !c.seccion_esperada)) {
        ctx.addIssue({ code: "custom", message: `${c.id}: debe_responder exige doc_esperado y seccion_esperada` });
      }
    }),
);

export type CasoDeEval = z.infer<typeof esquema>[number];

export function parsearCasos(json: unknown): CasoDeEval[] {
  const resultado = esquema.safeParse(json);
  if (!resultado.success) throw new Error(`evals/questions.json no es válido:\n${z.prettifyError(resultado.error)}`);
  return resultado.data;
}

export async function cargarCasos(): Promise<CasoDeEval[]> {
  return parsearCasos(JSON.parse(await readFile(ARCHIVO_DE_CASOS, "utf8")));
}
