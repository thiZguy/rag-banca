import { describe, expect, it } from "vitest";
import { chunkDocumento, type DocumentoAChunkear } from "./chunk-documento.js";

const ley: DocumentoAChunkear = { id: "ley-20009", titulo: "Ley 20.009", tipo: "ley" };

describe("chunkDocumento: leyes", () => {
  it("crea un Chunk por artículo, identificado por su número literal", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 1,
        texto: [
          "     Artículo 1.- Esta ley regula el régimen de responsabilidad.",
          "     Artículo 2.- Los usuarios podrán limitar su responsabilidad.",
        ].join("\n"),
      },
    ]);

    expect(chunks.map((c) => c.seccion)).toEqual(["Art. 1", "Art. 2"]);
    expect(chunks[0]!.texto).toBe("Artículo 1.- Esta ley regula el régimen de responsabilidad.");
  });

  it("mantiene los incisos dentro de su artículo aunque crucen de página, sin el encabezado de página", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 1,
        texto: [
          "     Artículo 4.- Tratándose de operaciones anteriores al aviso, el usuario",
          "deberá reclamar al emisor.",
          "     El reclamo podrá incluir operaciones realizadas en los sesenta días",
        ].join("\n"),
      },
      {
        numero: 2,
        texto: [
          "Ley 20009",
          "Biblioteca del Congreso Nacional de Chile - www.leychile.cl - documento generado el 28-Oct-2026",
          " página 2 de 8",
          "corridos anteriores a la fecha del aviso.",
          " ",
          "     Artículo 5.- Siempre que el monto reclamado sea inferior al umbral.",
        ].join("\n"),
      },
    ]);

    expect(chunks[0]).toMatchObject({
      seccion: "Art. 4",
      paginaInicio: 1,
      paginaFin: 2,
      texto: [
        "Artículo 4.- Tratándose de operaciones anteriores al aviso, el usuario deberá reclamar al emisor.",
        "El reclamo podrá incluir operaciones realizadas en los sesenta días corridos anteriores a la fecha del aviso.",
      ].join("\n"),
    });
    expect(chunks[1]).toMatchObject({ seccion: "Art. 5", paginaInicio: 2, paginaFin: 2 });
  });

  it("descarta el encabezado y pie de LeyChile en el orden en que los entrega el PDF", () => {
    const chunks = chunkDocumento(ley, [
      { numero: 2, texto: "     Artículo 6.- Los emisores, operadores y comercios deberán" },
      {
        numero: 3,
        texto: [
          "                                                                                    Ley 20009",
          " contar con sistemas de monitoreo.",
          "                                                                                    página 3 de 8",
          "      Biblioteca del Congreso Nacional de Chile - www.leychile.cl - documento generado el 28-Oct-2026",
        ].join("\n"),
      },
    ]);

    expect(chunks.map((c) => c.texto)).toEqual([
      "Artículo 6.- Los emisores, operadores y comercios deberán contar con sistemas de monitoreo.",
    ]);
  });

  it("arma la Ruta de encabezados con el Título y la antepone solo al texto embebido", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 1,
        texto: [
          "     Título I ",
          "     Del ámbito de aplicación y reglas generales ",
          " ",
          "     Artículo 1.- Esta ley regula el régimen de responsabilidad.",
          "     Título II ",
          "     Del procedimiento ",
          "     Artículo 5.- Siempre que el monto reclamado sea inferior al umbral.",
        ].join("\n"),
      },
    ]);

    expect(chunks[0]).toMatchObject({
      ruta: "Ley 20.009 > Título I: Del ámbito de aplicación y reglas generales > Art. 1",
      texto: "Artículo 1.- Esta ley regula el régimen de responsabilidad.",
      textoEmbebido:
        "Ley 20.009 > Título I: Del ámbito de aplicación y reglas generales > Art. 1\nArtículo 1.- Esta ley regula el régimen de responsabilidad.",
    });
    expect(chunks[1]!.ruta).toBe("Ley 20.009 > Título II: Del procedimiento > Art. 5");
  });

  it("reconoce un encabezado agrupador sin número, como «Disposiciones finales», y no lo pega al artículo anterior", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 8,
        texto: [
          "     Título IV ",
          "     De la investigación y sanción de los delitos ",
          "     Artículo 9.- Las penas se aplicarán sin perjuicio de los",
          "delitos contemplados en la ley Nº 19.223.",
          " ",
          "     Disposiciones finales ",
          " ",
          "     Artículo 10.- Los emisores deberán bloquear los medios de pago inactivos.",
        ].join("\n"),
      },
    ]);

    expect(chunks[0]!.texto).toBe("Artículo 9.- Las penas se aplicarán sin perjuicio de los delitos contemplados en la ley Nº 19.223.");
    expect(chunks[1]!.ruta).toBe("Ley 20.009 > Disposiciones finales > Art. 10");
  });

  it("toma el nombre completo del Título aunque ocupe dos renglones", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 7,
        texto: [
          "     Título III ",
          "     De la responsabilidad por fraude en tarjetas de pago y transacciones",
          "electrónicas ",
          "     Artículo 7.- Las conductas que a continuación se señalan constituyen delito.",
        ].join("\n"),
      },
    ]);

    expect(chunks[0]!.ruta).toBe(
      "Ley 20.009 > Título III: De la responsabilidad por fraude en tarjetas de pago y transacciones electrónicas > Art. 7",
    );
  });

  it("reconoce artículos bis, ter y quáter, numera el orden y deja fuera la fórmula de promulgación", () => {
    const chunks = chunkDocumento(ley, [
      {
        numero: 1,
        texto: [
          "     Artículo 4 bis.- Los usuarios deberán informarse.",
          "     Artículo 5 ter.- Se presumirá el dolo o la culpa grave.",
          "     Artículo 5 quáter.- El emisor deberá reportar a la Comisión.",
          "     Y por cuanto he tenido a bien aprobarlo y sancionarlo; por tanto promúlguese y",
          "llévese a efecto como Ley de la República.",
          "     Santiago, 18 de marzo de 2005.- RICARDO LAGOS ESCOBAR, Presidente de la",
        ].join("\n"),
      },
    ]);

    expect(chunks.map((c) => [c.orden, c.seccion])).toEqual([
      [0, "Art. 4 bis"],
      [1, "Art. 5 ter"],
      [2, "Art. 5 quáter"],
    ]);
    expect(chunks[2]!.texto).toBe("Artículo 5 quáter.- El emisor deberá reportar a la Comisión.");
  });
});
