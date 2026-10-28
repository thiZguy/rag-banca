import { VoyageAIClient } from "voyageai";
import type { Embedder } from "./embedder.js";

// Lotes chicos para no rozar el límite de tokens por request de la API.
const TAMANO_DE_LOTE = 64;
// Debe coincidir con la columna vector(1024) (ADR 0003).
const DIMENSION = 1024;

// Solo lo que usamos del cliente, para poder pasar uno falso en los tests.
export type ClienteVoyage = Pick<VoyageAIClient, "embed">;

export function crearEmbedderVoyage(
  apiKey: string,
  modelo = "voyage-4-large",
  cliente: ClienteVoyage = new VoyageAIClient({ apiKey }),
): Embedder {
  return {
    modelo,
    async embeber(textos, tipo) {
      const vectores: number[][] = [];
      for (let i = 0; i < textos.length; i += TAMANO_DE_LOTE) {
        const lote = textos.slice(i, i + TAMANO_DE_LOTE);
        const respuesta = await cliente.embed({
          input: lote,
          model: modelo,
          inputType: tipo,
          outputDimension: DIMENSION,
        });
        const datos = respuesta.data ?? [];
        if (datos.length !== lote.length) {
          throw new Error(`Voyage devolvió ${datos.length} embeddings para ${lote.length} textos`);
        }
        // Voyage no garantiza el orden: cada dato trae el index del texto que embebió
        // (si no lo trae, vale su posición en la respuesta).
        const porIndice = new Map(datos.map((dato, posicion) => [dato.index ?? posicion, dato.embedding]));
        for (let j = 0; j < lote.length; j++) {
          const embedding = porIndice.get(j);
          if (embedding?.length !== DIMENSION) throw new Error(`Voyage no devolvió embedding para el texto ${i + j}`);
          vectores.push(embedding);
        }
      }
      return vectores;
    },
  };
}
