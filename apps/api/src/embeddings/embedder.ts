export type TipoDeEntrada = "document" | "query";

// El modelo de embeddings queda detrás de esta interfaz para poder cambiarlo (ADR 0003)
// y para usar uno falso en los tests.
export interface Embedder {
  readonly modelo: string;
  embeber(textos: string[], tipo: TipoDeEntrada): Promise<number[][]>;
}
