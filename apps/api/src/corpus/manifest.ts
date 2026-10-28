import { readFile } from "node:fs/promises";
import { z } from "zod";
import { TIPOS_DE_DOCUMENTO } from "../chunking/chunk-documento.js";

export const CARPETA_CORPUS = new URL("../../../../corpus/", import.meta.url);

const esquema = z.object({
  fechaDeCorte: z.iso.date(),
  documentos: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      titulo: z.string().min(1),
      emisor: z.string().min(1),
      tipo: z.enum(TIPOS_DE_DOCUMENTO),
      fecha: z.iso.date(),
      url: z.url(),
      archivo: z.string().min(1),
      hash: z.string().regex(/^[0-9a-f]{64}$/),
    }),
  ),
});

export type Manifest = z.infer<typeof esquema>;
export type DocumentoDelManifest = Manifest["documentos"][number];

export async function cargarManifest(): Promise<Manifest> {
  return esquema.parse(JSON.parse(await readFile(new URL("manifest.json", CARPETA_CORPUS), "utf8")));
}
