export const TIPOS_DE_DOCUMENTO = ["ley", "decreto", "ran", "ncg", "circular", "dictamen"] as const;
export type TipoDocumento = (typeof TIPOS_DE_DOCUMENTO)[number];

export type DocumentoAChunkear = {
  id: string;
  titulo: string;
  tipo: TipoDocumento;
};

export type Pagina = { numero: number; texto: string };

export type Chunk = {
  seccion: string;
  ruta: string;
  orden: number;
  paginaInicio: number;
  paginaFin: number;
  texto: string;
  textoEmbebido: string;
};

type Linea = { texto: string; pagina: number; iniciaInciso: boolean };
type SeccionAbierta = { seccion: string; ruta: string; paginaInicio: number; paginaFin: number; incisos: string[] };

const ARTICULO = /^Artículo (\d+(?: (?:bis|ter|quáter|quinquies|sexies))?)\.-/;
// La fórmula de promulgación cierra el articulado y no pertenece a ninguna Sección.
const FIN_DEL_ARTICULADO = /^Y por cuanto he tenido a bien/;
const TITULO = /^Título ([IVXLC]+)$/;
const ENCABEZADO_BCN = /^Biblioteca del Congreso Nacional de Chile/;
const NUMERO_DE_PAGINA = /^página \d+ de \d+$/;
// Un encabezado agrupador sin número ("Disposiciones finales") es un renglón corto, con
// sangría y sin puntuación final, justo antes de un artículo.
const SIN_PUNTUACION_FINAL = /[^.:;,]$/;
// En los PDFs de LeyChile cada inciso empieza con sangría; las demás líneas son cortes por ancho.
const SANGRIA = /^\s{3,}\S/;

export function chunkDocumento(documento: DocumentoAChunkear, paginas: Pagina[]): Chunk[] {
  const chunks: Chunk[] = [];
  let actual: SeccionAbierta | undefined;
  let titulo: string | undefined;
  // El nombre del Título viene en el renglón siguiente y puede seguir en renglones sin sangría.
  let leyendoNombreDeTitulo: "no" | "primer-renglon" | "continuacion" = "no";

  const lineas = [...lineasDelCuerpo(paginas)];
  for (const [i, linea] of lineas.entries()) {
    if (FIN_DEL_ARTICULADO.test(linea.texto)) break;
    const inicioDeTitulo = TITULO.exec(linea.texto);
    if (inicioDeTitulo) {
      if (actual) chunks.push(cerrar(actual, chunks.length));
      actual = undefined;
      titulo = `Título ${inicioDeTitulo[1]}`;
      leyendoNombreDeTitulo = "primer-renglon";
      continue;
    }
    if (leyendoNombreDeTitulo === "primer-renglon") {
      titulo = `${titulo}: ${linea.texto}`;
      leyendoNombreDeTitulo = "continuacion";
      continue;
    }
    if (leyendoNombreDeTitulo === "continuacion" && !linea.iniciaInciso) {
      titulo = `${titulo} ${linea.texto}`;
      continue;
    }
    leyendoNombreDeTitulo = "no";
    if (esEncabezadoAgrupador(linea, lineas[i + 1])) {
      if (actual) chunks.push(cerrar(actual, chunks.length));
      actual = undefined;
      titulo = linea.texto;
      continue;
    }
    const inicio = ARTICULO.exec(linea.texto);
    if (inicio) {
      if (actual) chunks.push(cerrar(actual, chunks.length));
      const seccion = `Art. ${inicio[1]}`;
      const ruta = [documento.titulo, titulo, seccion].filter(Boolean).join(" > ");
      actual = { seccion, ruta, paginaInicio: linea.pagina, paginaFin: linea.pagina, incisos: [linea.texto] };
      continue;
    }
    if (!actual) continue;
    actual.paginaFin = linea.pagina;
    if (linea.iniciaInciso) actual.incisos.push(linea.texto);
    else actual.incisos[actual.incisos.length - 1] += ` ${linea.texto}`;
  }
  if (actual) chunks.push(cerrar(actual, chunks.length));
  return chunks;
}

function esEncabezadoAgrupador(linea: Linea, siguiente: Linea | undefined): boolean {
  return (
    linea.iniciaInciso &&
    linea.texto.length <= 80 &&
    SIN_PUNTUACION_FINAL.test(linea.texto) &&
    siguiente !== undefined &&
    ARTICULO.test(siguiente.texto)
  );
}

function cerrar(actual: SeccionAbierta, orden: number): Chunk {
  const texto = actual.incisos.join("\n");
  return {
    seccion: actual.seccion,
    ruta: actual.ruta,
    orden,
    paginaInicio: actual.paginaInicio,
    paginaFin: actual.paginaFin,
    texto,
    textoEmbebido: `${actual.ruta}\n${texto}`,
  };
}

function* lineasDelCuerpo(paginas: Pagina[]): Generator<Linea> {
  for (const pagina of paginas) {
    const lineas = pagina.texto.split("\n").filter((l) => l.trim() !== "");
    // Las páginas de LeyChile repiten arriba el título corto y abajo la línea de la Biblioteca.
    const esDeLeyChile = lineas.some((l) => ENCABEZADO_BCN.test(l.trim()));
    for (const [i, cruda] of lineas.entries()) {
      const texto = cruda.trim();
      if (NUMERO_DE_PAGINA.test(texto) || ENCABEZADO_BCN.test(texto)) continue;
      if (esDeLeyChile && i === 0) continue;
      yield { texto, pagina: pagina.numero, iniciaInciso: SANGRIA.test(cruda) };
    }
  }
}
