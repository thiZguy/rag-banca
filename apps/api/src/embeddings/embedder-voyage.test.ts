import { describe, expect, it } from "vitest";
import { crearEmbedderVoyage, type ClienteVoyage } from "./embedder-voyage.js";

// Cliente falso: responde con los datos que le pasemos, sin red.
function clienteQueResponde(data: { index?: number; embedding?: number[] }[]): ClienteVoyage {
  return { embed: async () => ({ data }) } as unknown as ClienteVoyage;
}

// Vector distinguible con la dimensión de la columna vector(1024).
const vector = (valor: number) => new Array<number>(1024).fill(valor);

describe("embedder de Voyage", () => {
  it("asigna cada embedding a su texto por index aunque Voyage los devuelva desordenados", async () => {
    const cliente = clienteQueResponde([
      { index: 1, embedding: vector(2) },
      { index: 0, embedding: vector(1) },
    ]);

    const vectores = await crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a", "b"], "document");

    expect(vectores).toEqual([vector(1), vector(2)]);
  });

  it("usa la posición en la respuesta cuando Voyage no trae index", async () => {
    const cliente = clienteQueResponde([{ embedding: vector(1) }, { embedding: vector(2) }]);

    const vectores = await crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a", "b"], "document");

    expect(vectores).toEqual([vector(1), vector(2)]);
  });

  it("falla si Voyage devuelve más embeddings que textos", async () => {
    const cliente = clienteQueResponde([
      { index: 0, embedding: vector(1) },
      { index: 1, embedding: vector(2) },
      { index: 2, embedding: vector(3) },
    ]);

    await expect(crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a", "b"], "document")).rejects.toThrow(
      /Voyage devolvió 3 embeddings para 2 textos/,
    );
  });

  it("falla si un embedding no tiene la dimensión de la columna", async () => {
    const cliente = clienteQueResponde([{ index: 0, embedding: [] }]);

    await expect(crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a"], "document")).rejects.toThrow(
      /Voyage no devolvió embedding para el texto 0/,
    );
  });

  it("falla con un error claro si Voyage omite un embedding", async () => {
    const cliente = clienteQueResponde([{ index: 0, embedding: vector(1) }, { index: 1 }]);

    await expect(crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a", "b"], "document")).rejects.toThrow(
      /Voyage no devolvió embedding para el texto 1/,
    );
  });
});
