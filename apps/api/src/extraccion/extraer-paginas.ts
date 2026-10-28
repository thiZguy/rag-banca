import { getDocumentProxy } from "unpdf";
import type { Pagina } from "../chunking/chunk-documento.js";

type ItemDeTexto = { str: string; x: number; y: number };

// Ancho aproximado de un carácter en puntos; solo se usa para traducir la sangría a espacios.
const PUNTOS_POR_ESPACIO = 6;

export async function extraerPaginas(pdf: Uint8Array): Promise<Pagina[]> {
  const documento = await getDocumentProxy(new Uint8Array(pdf));
  const paginas: Pagina[] = [];
  for (let numero = 1; numero <= documento.numPages; numero++) {
    const { items } = await (await documento.getPage(numero)).getTextContent();
    const itemsDeTexto = items.flatMap((item): ItemDeTexto[] =>
      "str" in item && item.str !== "" ? [{ str: item.str, x: item.transform[4], y: item.transform[5] }] : [],
    );
    paginas.push({ numero, texto: aLineas(itemsDeTexto) });
  }
  return paginas;
}

// pdf.js entrega ítems de texto posicionados; los agrupa en renglones de arriba hacia abajo
// y conserva la sangría, que es lo que distingue un inciso nuevo de un corte de línea.
function aLineas(items: ItemDeTexto[]): string {
  const renglones = new Map<number, ItemDeTexto[]>();
  for (const f of items) {
    const y = Math.round(f.y);
    renglones.set(y, [...(renglones.get(y) ?? []), f]);
  }
  const margen = Math.min(...items.map((f) => f.x));
  return [...renglones.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, renglon]) => {
      renglon.sort((a, b) => a.x - b.x);
      const sangria = " ".repeat(Math.floor((renglon[0]!.x - margen) / PUNTOS_POR_ESPACIO));
      return sangria + renglon.map((f) => f.str).join("");
    })
    .join("\n");
}
