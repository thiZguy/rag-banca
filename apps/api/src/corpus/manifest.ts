import { createHash } from "node:crypto";
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
  return parsearManifest(JSON.parse(await readFile(new URL("manifest.json", CARPETA_CORPUS), "utf8")));
}

// Con 16 Documentos, "documentos[7].fecha" obliga a contar: cada error nombra el id del Documento.
export function parsearManifest(json: unknown): Manifest {
  const resultado = esquema.safeParse(json);
  if (resultado.success) return resultado.data;
  const documentos = (json as { documentos?: { id?: unknown }[] }).documentos;
  const errores = resultado.error.issues.map(({ path, message }) => {
    if (path[0] !== "documentos" || typeof path[1] !== "number") return `- ${path.join(".") || "manifest"}: ${message}`;
    const id = documentos?.[path[1]]?.id ?? `documento ${path[1] + 1}`;
    return `- ${String(id)} → ${path.slice(2).join(".")}: ${message}`;
  });
  throw new Error(`corpus/manifest.json no es válido:\n${errores.join("\n")}`);
}

// El hash del manifest es la foto fechada del Corpus: si el PDF cambió sin actualizarlo,
// la base guardaría un hash que no describe lo que se embebió.
export async function leerPdfDelCorpus(documento: DocumentoDelManifest): Promise<Uint8Array> {
  const pdf = await readFile(new URL(documento.archivo, CARPETA_CORPUS));
  const hash = createHash("sha256").update(pdf).digest("hex");
  if (hash !== documento.hash) {
    throw new Error(`${documento.id}: ${documento.archivo} no calza con el hash del manifest (manifest ${documento.hash}, PDF ${hash})`);
  }
  return pdf;
}
