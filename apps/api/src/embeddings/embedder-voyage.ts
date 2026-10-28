import { VoyageAIClient } from "voyageai";
import type { Embedder } from "./embedder.js";

// Lotes chicos para no rozar el límite de tokens por request de la API.
const TAMANO_DE_LOTE = 64;
// Debe coincidir con la columna vector(1024) (ADR 0003).
const DIMENSION = 1024;

export function crearEmbedderVoyage(apiKey: string, modelo = "voyage-4-large"): Embedder {
  const cliente = new VoyageAIClient({ apiKey });
  return {
    modelo,
    async embeber(textos, tipo) {
      const vectores: number[][] = [];
      for (let i = 0; i < textos.length; i += TAMANO_DE_LOTE) {
        const respuesta = await cliente.embed({
          input: textos.slice(i, i + TAMANO_DE_LOTE),
          model: modelo,
          inputType: tipo,
          outputDimension: DIMENSION,
        });
        for (const dato of respuesta.data ?? []) vectores.push(dato.embedding ?? []);
      }
      if (vectores.length !== textos.length) {
        throw new Error(`Voyage devolvió ${vectores.length} embeddings para ${textos.length} textos`);
      }
      return vectores;
    },
  };
}
