import { setTimeout } from "node:timers/promises";
import { VoyageAIClient } from "voyageai";
import type { Embedder } from "./embedder.js";

// Debe coincidir con la columna vector(1024) (ADR 0003).
const DIMENSION = 1024;
// Tope de textos por request; con textos cortos, como preguntas, el que manda es este.
const TAMANO_DE_LOTE = 64;
// Sin medio de pago Voyage permite 10K tokens y 3 requests por minuto (ADR 0006).
// Contamos tokens como caracteres / 3, que en español sobreestima y deja margen.
const TOKENS_POR_LOTE = 9_000;
const tokensEstimados = (texto: string) => Math.ceil(texto.length / 3);
// Un lote por minuto respeta a la vez los 10K tokens y los 3 requests por minuto.
const PAUSA_ENTRE_REQUESTS_MS = 60_000;

export type Reloj = { ahora(): number; esperar(ms: number): Promise<void> };
const relojReal: Reloj = { ahora: Date.now, esperar: (ms) => setTimeout(ms) };

// Solo lo que usamos del cliente, para poder pasar uno falso en los tests.
export type ClienteVoyage = Pick<VoyageAIClient, "embed">;

export function crearEmbedderVoyage(
  apiKey: string,
  modelo = "voyage-4-large",
  cliente: ClienteVoyage = new VoyageAIClient({ apiKey }),
  reloj: Reloj = relojReal,
): Embedder {
  // La pausa cuenta desde el último request de este embedder, aunque haya sido en otra
  // llamada: la ingesta llama a embeber una vez por Documento.
  let ultimoRequest: number | undefined;
  return {
    modelo,
    async embeber(textos, tipo) {
      const vectores: number[][] = [];
      for (const { inicio, lote } of armarLotes(textos)) {
        if (ultimoRequest !== undefined) {
          const falta = ultimoRequest + PAUSA_ENTRE_REQUESTS_MS - reloj.ahora();
          if (falta > 0) await reloj.esperar(falta);
        }
        ultimoRequest = reloj.ahora();
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
          if (embedding?.length !== DIMENSION) throw new Error(`Voyage no devolvió embedding para el texto ${inicio + j}`);
          vectores.push(embedding);
        }
      }
      return vectores;
    },
  };
}

// Agrupa textos consecutivos hasta el tope de tokens o de textos; un texto que solo
// supera el tope va en un lote propio.
function armarLotes(textos: string[]): { inicio: number; lote: string[] }[] {
  const lotes: { inicio: number; lote: string[] }[] = [];
  let tokens = 0;
  for (const [i, texto] of textos.entries()) {
    const actual = lotes.at(-1);
    const tokensDelTexto = tokensEstimados(texto);
    if (actual && actual.lote.length < TAMANO_DE_LOTE && tokens + tokensDelTexto <= TOKENS_POR_LOTE) {
      actual.lote.push(texto);
      tokens += tokensDelTexto;
    } else {
      lotes.push({ inicio: i, lote: [texto] });
      tokens = tokensDelTexto;
    }
  }
  return lotes;
}
