import { describe, expect, it } from "vitest";
import { crearEmbedderVoyage, type ClienteVoyage } from "./embedder-voyage.js";

// Cliente falso: responde con los datos que le pasemos, sin red.
function clienteQueResponde(data: { index?: number; embedding?: number[] }[]): ClienteVoyage {
  return { embed: async () => ({ data }) } as unknown as ClienteVoyage;
}

// Vector distinguible con la dimensión de la columna vector(1024).
const vector = (valor: number) => new Array<number>(1024).fill(valor);

// Cliente falso que anota cada lote recibido y responde un embedding por texto.
function clienteQueAnota() {
  const lotes: string[][] = [];
  const cliente = {
    embed: async ({ input }: { input: string[] }) => {
      lotes.push(input);
      return { data: input.map((_, index) => ({ index, embedding: vector(1) })) };
    },
  } as unknown as ClienteVoyage;
  return { cliente, lotes };
}

// Reloj falso: esperar no duerme, solo anota la espera y adelanta la hora.
function relojFalso() {
  const esperas: number[] = [];
  let hora = 0;
  return {
    reloj: {
      ahora: () => hora,
      esperar: async (ms: number) => {
        esperas.push(ms);
        hora += ms;
      },
    },
    esperas,
    pasan: (ms: number) => void (hora += ms),
  };
}

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

  it("arma lotes que no pasan los ~9K tokens que permite Voyage sin medio de pago", async () => {
    const { cliente, lotes } = clienteQueAnota();
    const textoDe4kTokens = (letra: string) => letra.repeat(12_000);

    await crearEmbedderVoyage("key", "voyage-4-large", cliente, relojFalso().reloj).embeber(
      [textoDe4kTokens("a"), textoDe4kTokens("b"), textoDe4kTokens("c")],
      "document",
    );

    expect(lotes.map((l) => l.map((t) => t[0]))).toEqual([["a", "b"], ["c"]]);
  });

  it("deja un minuto entre requests, también entre una llamada y la siguiente", async () => {
    const { reloj, esperas, pasan } = relojFalso();
    const embedder = crearEmbedderVoyage("key", "voyage-4-large", clienteQueAnota().cliente, reloj);

    // Primer Documento: 3 lotes. No espera antes del primero.
    await embedder.embeber(["a", "b", "c"].map((l) => l.repeat(15_000)), "document");
    expect(esperas).toEqual([60_000, 60_000]);

    // Segundo Documento, 20 s después: espera solo lo que falta del minuto.
    pasan(20_000);
    await embedder.embeber(["d"], "document");
    expect(esperas).toEqual([60_000, 60_000, 40_000]);

    // Pasado el minuto, no espera.
    pasan(90_000);
    await embedder.embeber(["¿qué plazo tengo para reclamar?"], "query");
    expect(esperas).toEqual([60_000, 60_000, 40_000]);
  });

  it("falla con un error claro si Voyage omite un embedding", async () => {
    const cliente = clienteQueResponde([{ index: 0, embedding: vector(1) }, { index: 1 }]);

    await expect(crearEmbedderVoyage("key", "voyage-4-large", cliente).embeber(["a", "b"], "document")).rejects.toThrow(
      /Voyage no devolvió embedding para el texto 1/,
    );
  });
});
