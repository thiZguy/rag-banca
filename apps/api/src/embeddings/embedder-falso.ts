import type { Embedder } from "./embedder.js";

// Determinista y sin red: cada palabra suma en una dimensión fija, así que dos textos
// que comparten palabras quedan cerca. Basta para probar el orden por coseno.
// Usa la misma dimensión que la columna vector(1024).
const DIMENSION = 1024;

export function crearEmbedderFalso(modelo = "falso"): Embedder {
  return {
    modelo,
    async embeber(textos) {
      return textos.map((texto) => {
        const vector = new Array<number>(DIMENSION).fill(0);
        for (const palabra of texto.toLowerCase().match(/\p{L}+/gu) ?? []) {
          vector[hash(palabra) % DIMENSION]! += 1;
        }
        const norma = Math.hypot(...vector) || 1;
        return vector.map((v) => v / norma);
      });
    },
  };
}

function hash(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  return h >>> 0;
}
