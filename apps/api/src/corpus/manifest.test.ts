import { describe, expect, it } from "vitest";
import { cargarManifest, leerPdfDelCorpus, parsearManifest } from "./manifest.js";

const ley = {
  id: "ley-20009",
  titulo: "Ley 20.009",
  emisor: "Congreso Nacional",
  tipo: "ley",
  fecha: "2024-05-30",
  url: "https://www.bcn.cl/leychile/navegar?idNorma=236736",
  archivo: "raw/ley-20009.pdf",
  hash: "a".repeat(64),
};
const ncg = { ...ley, id: "ncg-538", titulo: "NCG 538", emisor: "CMF", tipo: "ncg", archivo: "raw/ncg-538.pdf" };

describe("parsearManifest", () => {
  it("acepta un manifest con la Fecha de corte y Documentos completos", () => {
    expect(parsearManifest({ fechaDeCorte: "2026-10-28", documentos: [ley, ncg] }).documentos.map((d) => d.id)).toEqual([
      "ley-20009",
      "ncg-538",
    ]);
  });

  it("rechaza un Documento con un campo faltante y nombra su id", () => {
    const { fecha: _, ...sinFecha } = ncg;

    expect(() => parsearManifest({ fechaDeCorte: "2026-10-28", documentos: [ley, sinFecha] })).toThrow(/ncg-538.*fecha/s);
  });
});

describe("leerPdfDelCorpus", () => {
  it("devuelve los bytes del PDF cuando su SHA-256 calza con el manifest", async () => {
    const { documentos } = await cargarManifest();
    const ley = documentos.find((d) => d.id === "ley-20009")!;

    const pdf = await leerPdfDelCorpus(ley);

    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe("%PDF-");
  });

  it("cada PDF del Corpus calza con el hash de su entrada en el manifest", async () => {
    const { documentos } = await cargarManifest();

    // Si alguno no calza, el error nombra su id.
    await Promise.all(documentos.map(leerPdfDelCorpus));
  });

  it("falla si el PDF no calza con el hash del manifest", async () => {
    const { documentos } = await cargarManifest();
    const ley = documentos.find((d) => d.id === "ley-20009")!;

    await expect(leerPdfDelCorpus({ ...ley, hash: "0".repeat(64) })).rejects.toThrow(
      /^ley-20009: raw\/ley-20009\.pdf no calza con el hash del manifest/,
    );
  });
});
