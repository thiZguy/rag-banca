import { describe, expect, it } from "vitest";
import { cargarManifest, leerPdfDelCorpus } from "./manifest.js";

describe("leerPdfDelCorpus", () => {
  it("devuelve los bytes del PDF cuando su SHA-256 calza con el manifest", async () => {
    const { documentos } = await cargarManifest();
    const ley = documentos.find((d) => d.id === "ley-20009")!;

    const pdf = await leerPdfDelCorpus(ley);

    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe("%PDF-");
  });

  it("falla si el PDF no calza con el hash del manifest", async () => {
    const { documentos } = await cargarManifest();
    const ley = documentos.find((d) => d.id === "ley-20009")!;

    await expect(leerPdfDelCorpus({ ...ley, hash: "0".repeat(64) })).rejects.toThrow(
      /raw\/ley-20009\.pdf no calza con el hash del manifest/,
    );
  });
});
