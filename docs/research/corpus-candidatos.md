# Documentos candidatos para el Corpus

Investigación del 28-oct-2026. Hay 25 Documentos candidatos repartidos en 4 Temas, para elegir entre 10 y 20. Solo se usaron fuentes primarias: cmfchile.cl, bcn.cl (LeyChile), sernac.cl y bcentral.cl.

**Cómo se verificó.** Cada PDF se descargó fuera del repo y se le extrajo el texto con `pypdf` 6.21 (en esta máquina no hay `pdftotext`). Se registraron las páginas, los caracteres por página, las páginas sin texto, el patrón de numeración y las páginas con líneas cortas, que suelen indicar tablas. "Sí" en *texto seleccionable* significa que todas las páginas devolvieron texto (más de 1.000 caracteres por página en promedio). La *fecha* es la de la última modificación incorporada en el texto descargado: la versión que declara LeyChile para leyes y decretos, y el pie de página "Circular/NCG N° … / fecha" más reciente para los capítulos RAN.

**Sobre las URLs de LeyChile.** La tabla da la página oficial (`navegar?idNorma=`). El PDF del texto vigente se genera con el exportador de LeyChile (plantilla en *Fuentes y notas*). No es un archivo estático, pero se descargó sin problemas para todas las normas de BCN de esta lista.

## Tema 1: Autenticación y fraude en transferencias y medios de pago

| id slug propuesto | Título | Emisor | Tipo | Fecha (versión) | Págs. | Texto seleccionable | Numeración | URL |
|---|---|---|---|---|---|---|---|---|
| `ley-20009` | Ley 20.009, establece un régimen de limitación de responsabilidad para titulares o usuarios de tarjetas de pago y transacciones electrónicas en caso de extravío, hurto, robo o fraude | Congreso / Min. Hacienda (texto BCN) | Ley (texto actualizado) | Última versión 30-may-2024 (incluye Ley 21.234 de 2020 y Ley 21.673 de 2024) | 8 | Sí | Títulos + `Artículo N.-` con incisos | https://www.bcn.cl/leychile/navegar?idNorma=236736 |
| `ncg-538` | NCG N° 538, norma sobre medidas de seguridad y autenticación de operaciones sometidas a la Ley N° 20.009 | CMF | NCG | 17-jun-2025 | 5 | Sí | Encabezados con nombre y sin número ("Definiciones", "Requisitos generales", "Vigencia"); definiciones numeradas 1., 2. y letras a), b) | https://www.cmfchile.cl/normativa/ncg_538_2025.pdf |
| `ncg-568` | NCG N° 568, modifica la NCG 538 sobre medidas de seguridad y autenticación | CMF | NCG (modificatoria) | 01-jun-2026 | 3 | Sí | Instrucciones de reemplazo sin numerar | https://www.cmfchile.cl/normativa/ncg_568_2026.pdf |
| `ran-1-7` | RAN Capítulo 1-7, Transferencia electrónica de información y fondos | CMF | Capítulo RAN | Circular N° 2.368 / 30-ene-2026 | 8 | Sí | Numerales 1., 4.2, 5.4.1 | https://www.cmfchile.cl/portal/normativa/624/articles-28893_doc_pdf.pdf |
| `ran-8-41` | RAN Capítulo 8-41, Tarjetas de pago | CMF | Capítulo RAN | NCG N° 541 / 23-jul-2025 | 14 | Sí | Numerales 2.3.5 (p. ej. 2.3.5 "Pérdida, hurto, robo, falsificación…") | https://www.cmfchile.cl/portal/normativa/624/articles-28944_doc_pdf.pdf |
| `sernac-dictamen-fraude-medios-pago` | Dictamen interpretativo sobre fraude en medios de pago (solicitud N° 35992824) | SERNAC | Dictamen interpretativo (resolución exenta) | 24-feb-2026 | 7 | Sí, pero la extracción sale fragmentada (ver notas) | Vistos + Considerandos numerados `1.-`, `2.-`; sin artículos | https://www.sernac.cl/portal/618/articles-88180_archivo_01.pdf |
| `bcch-cnf-iii-j-1` | Compendio de Normas Financieras, Capítulo III.J.1 Emisión de tarjetas de pago (más III.J.1.1 crédito, III.J.1.2 débito, III.J.1.3 prepago) | Banco Central de Chile | Compendio BCCh | **No verificada** | ? | **No verificado** | Títulos romanos I., II. (según extracto de búsqueda) | https://www.bcentral.cl/documents/33528/115568/CapIIIJ1.pdf |
| `ncg-544` | NCG N° 544, modifica la NCG 538 y posterga su vigencia | CMF | NCG (modificatoria) | 07-ago-2025 | 2 | **No: escaneada / imagen** (188 caracteres en total) | n/a | https://www.cmfchile.cl/normativa/ncg_544_2025.pdf |

## Tema 2: Reclamos y atención de clientes

| id slug propuesto | Título | Emisor | Tipo | Fecha (versión) | Págs. | Texto seleccionable | Numeración | URL |
|---|---|---|---|---|---|---|---|---|
| `dfl-3-2021-ley-19496` | DFL 3 (Economía), fija texto refundido, coordinado y sistematizado de la Ley N° 19.496 sobre protección de los derechos de los consumidores | Min. Economía (texto BCN) | Ley (texto refundido, DFL) | Última versión 11-jul-2025 (Ley 21.755); vigente hasta 30-nov-2026 | 69 | Sí | Títulos + párrafos + `Artículo N.-` con sufijos (17 B, 55 A, 56 D). El Título V (arts. 55–56 D) trata el Sello SERNAC y el SAC; el art. 56 fija 10 días hábiles para responder reclamos | https://www.bcn.cl/leychile/navegar?idNorma=1160403 |
| `ran-1-8` | RAN Capítulo 1-8, Canales de atención bancarios | CMF | Capítulo RAN | NCG N° 543 / 01-ago-2025 | 8 | Sí | Numerales 1.–5. (5.1 "Atención de consultas y reclamos", 5.2 "Medidas de seguridad") | https://www.cmfchile.cl/portal/normativa/624/articles-28894_doc_pdf.pdf |
| `ds-41-2012-sello-sernac` | Decreto 41 de 2012, aprueba reglamento sobre "Sello SERNAC" (SAC, mediación y arbitraje financiero) | Min. Economía | Reglamento (decreto) | Versión única 01-jul-2012 | 27 | Sí | Títulos + `Artículo N°` | https://www.bcn.cl/leychile/navegar?idNorma=1041742 |
| `sernac-dictamen-seguridad-bancos` | Dictamen sobre deber de seguridad y profesionalidad en el consumo respecto de entidades bancarias (solicitud N° 21.534) | SERNAC | Dictamen administrativo | ago-2021 (según la marca de tiempo del archivo; no verificada) | 4 | Sí | Vistos + Considerandos numerados | https://www.sernac.cl/portal/618/articles-63094_archivo_01.pdf |
| `sernac-circ-equidad-adhesion` | Circular interpretativa sobre criterios de equidad en las estipulaciones de contratos de adhesión de consumo | SERNAC | Circular interpretativa | dic-2021 (según la marca de tiempo del archivo; no verificada) | 63 | Sí | Numerales en apartados (53 encabezados numerados) | https://www.sernac.cl/portal/618/articles-64611_archivo_01.pdf |
| `sernac-circ-cobranza` | Circular interpretativa sobre gestiones de cobranza extrajudicial y judicial | SERNAC | Circular interpretativa | 21-mar-2019 | 30 | Sí | Apartados numerados + citas de artículos | https://www.sernac.cl/portal/618/articles-9198_archivo_01.pdf |

## Tema 3: Ciberseguridad y gestión de riesgo operacional

| id slug propuesto | Título | Emisor | Tipo | Fecha (versión) | Págs. | Texto seleccionable | Numeración | URL |
|---|---|---|---|---|---|---|---|---|
| `ran-20-10` | RAN Capítulo 20-10, Gestión de la seguridad de la información y ciberseguridad | CMF | Capítulo RAN | Circular N° 2.261 / 06-jul-2020 | 11 | Sí | Numerales 1.–6., 4.1, 4.2 | https://www.cmfchile.cl/portal/normativa/624/articles-29310_doc_pdf.pdf |
| `ran-1-13` | RAN Capítulo 1-13, Clasificación de gestión y solvencia | CMF | Capítulo RAN | Circular N° 2.373 / 14-jul-2026 | 41 | Sí (1 página con aspecto de tabla) | Títulos romanos I., II. + numerales 3.1.1 + letras a), b), c). Incluye "Administración del riesgo operacional" y la gestión de reclamos | https://www.cmfchile.cl/portal/normativa/624/articles-28898_doc_pdf.pdf |
| `ran-20-7` | RAN Capítulo 20-7, Externalización de servicios | CMF | Capítulo RAN | Circular N° 2.244 / 23-dic-2019 | 17 | Sí | Títulos romanos I.–IV. + numerales 1., 2. dentro de cada título | https://www.cmfchile.cl/portal/normativa/624/articles-28982_doc_pdf.pdf |
| `ran-20-8` | RAN Capítulo 20-8, Información de incidentes operacionales | CMF | Capítulo RAN | NCG N° 515 / 25-jul-2024 | 3 | Sí | Numerales 1., 1.1–1.3 | https://www.cmfchile.cl/portal/normativa/624/articles-28983_doc_pdf.pdf |
| `ran-20-9` | RAN Capítulo 20-9, Gestión de la continuidad del negocio | CMF | Capítulo RAN | Circular N° 3.642 / 09-oct-2018 | 6 | Sí | Títulos romanos I.–III. | https://www.cmfchile.cl/portal/normativa/624/articles-28984_doc_pdf.pdf |
| `ran-21-8` | RAN Capítulo 21-8, Metodología estandarizada para el cómputo de activos ponderados por riesgo operacional | CMF | Capítulo RAN | Circular N° 2.292 / 19-ago-2021 | 10 | Sí (PDF cifrado con permisos; extrae bien) | Numerales 1., 2. | https://www.cmfchile.cl/portal/normativa/624/articles-38801_doc_pdf.pdf |
| `ley-21663` | Ley 21.663, Ley Marco de Ciberseguridad | Congreso / Min. Interior (texto BCN) | Ley (texto actualizado) | Última versión 01-mar-2025 | 28 | Sí | Títulos + `Artículo N°.` con epígrafe | https://www.bcn.cl/leychile/navegar?idNorma=1202434 |
| `ds-295-2024-reporte-incidentes` | Decreto 295, aprueba reglamento de reporte de incidentes de ciberseguridad de la Ley N° 21.663 | Min. Interior | Reglamento (decreto) | Versión única 01-ene-2025 (publicado el 01-mar-2025) | 8 | Sí | Títulos + `Artículo N°` | https://www.bcn.cl/leychile/navegar?idNorma=1211466 |

## Tema 4: Open finance / Ley Fintec

| id slug propuesto | Título | Emisor | Tipo | Fecha (versión) | Págs. | Texto seleccionable | Numeración | URL |
|---|---|---|---|---|---|---|---|---|
| `ley-21521` | Ley 21.521, promueve la competencia e inclusión financiera a través de la innovación y tecnología en la prestación de servicios financieros (Ley Fintec) | Congreso / Min. Hacienda (texto BCN) | Ley | Versión única 03-feb-2023 | 41 | Sí | `TÍTULO I`–`V` + `Artículo N.-` con epígrafe. El Título III (arts. 17–27) regula el Sistema de Finanzas Abiertas | https://www.bcn.cl/leychile/navegar?idNorma=1187323 |
| `ncg-514` | NCG N° 514, norma que regula el Sistema de Finanzas Abiertas | CMF | NCG | 03-jul-2024 | 91 | Sí | Secciones romanas I–IV + letras A., B. + numerales 1., 1.1; índice al inicio. **Los anexos (págs. ~69–89) son tablas** de variables y productos | https://www.cmfchile.cl/normativa/ncg_514_2024.pdf |
| `ncg-569` | NCG N° 569, modifica la NCG 514 que regula el SFA e incorpora el Anexo N° 3 | CMF | NCG (modificatoria) | 01-jun-2026 | 101 | Sí | "Se reemplaza la sección I.C.1 numeral 1.2…" y luego el texto nuevo con la numeración de la NCG 514. **El Anexo 3 (técnico) tiene muchas tablas** (~19 págs.) | https://www.cmfchile.cl/normativa/ncg_569_2026.pdf |
| `cmf-faq-sfa` | Preguntas frecuentes, Sistema de Finanzas Abiertas (SFA) | CMF | Documento complementario (FAQ) | 2026 (menciona el pre-registro de oct-2026; fecha exacta no verificada) | 11 | Sí | Preguntas numeradas 1., 2., … | https://www.cmfchile.cl/sitio/aplic/serdoc/ver_sgd.php?s567=d8a8944e8462648aaeca28f28112e23aVFdwQmVVNXFRVEpOUkUweVRtcEJlRTVCUFQwPQ==&secuencia=-1&t=1793199064 |

## Selección recomendada (16)

1. `ley-20009`: base legal del régimen de fraude. Trae los plazos de restitución (10 días hábiles) y el tope de 35 UF.
2. `ncg-538`: define la ARC y los casos en que es obligatoria. Responde directo la pregunta modelo del PLAN ("qué exige la CMF para autenticar una transferencia").
3. `ncg-568`: cambia los casos obligatorios de ARC y su vigencia (1-ago-2026). Sin ella, el Corpus queda desactualizado. Es corta.
4. `ran-1-7`: requisitos de los sistemas de transferencias electrónicas y prevención de fraudes (numeral 4.2). Numeración muy limpia.
5. `ran-8-41`: tarjetas de pago, incluido qué hacer ante pérdida, robo o fraude (2.3.5) y los sistemas de autorización (2.3.6).
6. `sernac-dictamen-fraude-medios-pago`: la visión del consumidor sobre la Ley 20.009 (carga de la prueba, no rechazar unilateralmente). Sirve para preguntas que combinan dos Documentos.
7. `dfl-3-2021-ley-19496`: texto refundido vigente de la ley del consumidor. El art. 56 (10 días hábiles para que el SAC responda) es candidato natural para el eval q07 del PLAN.
8. `ran-1-8`: canales de atención y el numeral 5.1 sobre consultas y reclamos. Es corto y está bien numerado.
9. `ds-41-2012-sello-sernac`: reglamento del SAC y la mediación o arbitraje financiero. Complementa el art. 56 con plazos operativos.
10. `ran-20-10`: norma central de ciberseguridad bancaria. Corta y numerada.
11. `ran-1-13`: criterios de evaluación de gestión, incluidos riesgo operacional y gestión de reclamos. Conecta los Temas 2 y 3.
12. `ran-20-7`: externalización y nube. Pregunta frecuente de los equipos de desarrollo.
13. `ran-20-8`: reporte de incidentes operacionales a la CMF, clientes e industria. Corta y con plazos concretos.
14. `ley-21521`: base legal de la Ley Fintec y del SFA (Título III).
15. `ncg-514`: la norma operativa del SFA. Hay que decidir si se ingieren o no los anexos con tablas.
16. `ncg-569`: actualiza la NCG 514. No existe texto refundido, así que sin ella el SFA queda con requisitos de 2024.

Para dejar el Corpus en 15, se puede sacar `ncg-569`. Habría que aceptar que el SFA queda fechado en 2024, o dejar el SFA solo con `ley-21521` y `ncg-514`. También sirve guardar `ran-20-9`, `ley-21663` y `ds-295-2024-reporte-incidentes` como reserva para el Tema 3, o como preguntas fuera del Corpus en los evals (`debe_responder: false`).

## Fuentes y notas

**Problemas encontrados**

- **NCG 544 está escaneada.** El PDF de 2 páginas casi no tiene texto extraíble (188 caracteres, solo el "REF."). Se descarta. Su efecto, la postergación de la vigencia de la NCG 538, quedó reemplazado por la NCG 568.
- **Banco Central (bcentral.cl) no verificado.** Todas las descargas de PDFs del Compendio de Normas Financieras devolvieron una página de desafío anti-bot (Incapsula), tanto desde `curl` (con varios user-agents y el dominio espejo `coleccion.bcentral.cl`) como con la herramienta de fetch. No se pudieron confirmar fecha, páginas ni texto seleccionable del Capítulo III.J.1. Se puede bajar a mano desde el navegador. El BCCh tampoco ha emitido todavía la norma de iniciadores de pago de la Ley Fintec: un discurso del BCCh dice que la consulta se esperaba para el tercer trimestre de 2026.
- **No hay texto refundido de la NCG 514.** La CMF publica la NCG 514 original y la NCG 569 (101 páginas), que reemplaza secciones completas. Para el RAG, las dos conviven: la 569 reemplaza numerales de la 514, y una pregunta puede recuperar la versión antigua. Conviene marcar los Chunks de la 514 que fueron reemplazados, o advertirlo en la cita.
- **NCG 538 + 568: pasa lo mismo, pero en pequeño.** La 568 reemplaza un bullet y el párrafo de vigencia de la 538. Las dos son cortas.
- **Dictamen SERNAC de fraude: extracción fragmentada.** `pypdf` devuelve casi una palabra por línea. Al re-unir los espacios, el texto queda completo y legible. No se probó con `pdftotext`, que suele manejar mejor este layout. Los números de resolución exenta salen en blanco (firma electrónica). La fecha 24-feb-2026 viene de la página web del SERNAC.
- **Leyes modificatorias descartadas a propósito.** La Ley 21.234 (2020) y la Ley 21.673 (2024, "adopta medidas para combatir el sobreendeudamiento") modifican la Ley 20.009 y ya están incorporadas en su texto actualizado de BCN (versión 30-may-2024). La Ley 19.496 en su idNorma original (61438) está refundida en el DFL 3. Se usa el DFL 3.
- **DFL 3 tiene una versión con vigencia diferida desde el 01-dic-2026.** La versión descargada (11-jul-2025) deja de regir el 30-nov-2026. Hay que volver a exportarla después de esa fecha o fechar el Corpus antes. No se revisó qué cambia.
- **No se encontró una norma CMF específica de gestión de reclamos para bancos.** En la RAN, los reclamos aparecen en el 1-8 (numeral 5.1) y el 1-13 (criterios de evaluación). El trámite "Reclamos contra bancos ante la CMF" (https://www.cmfchile.cl/mascerca/601/fo-article-26815.pdf, 2 págs.) es una ficha informativa y no norma; por eso no se incluyó. Para el Tema 2 se completó con normativa SERNAC.
- **La RAN 18-5 (información de deudores) se revisó y se descartó.** Casi no trata reclamos (1 mención). La CMF tiene en consulta una modificación sobre reclamos asociados a deudores, pero aún no es norma.
- **Fechas de documentos SERNAC sin fecha impresa.** La fecha de `sernac-dictamen-seguridad-bancos` y de `sernac-circ-equidad-adhesion` se estimó con el parámetro `ts` de la URL (fecha de carga del archivo). No es la fecha de la resolución.
- **Las páginas de LeyChile difieren entre `file` y `pypdf`.** Se usó el conteo de `pypdf`, que coincide con el "página 1 de N" impreso en el PDF.

**Tablas.** Solo dos Documentos tienen contenido clave en tablas: `ncg-514` (anexos 1–2, aprox. págs. 69–89) y `ncg-569` (Anexo 3 técnico). En el resto del cuerpo normativo, la heurística (páginas con más del 50% de líneas cortas) no detectó tablas, salvo 1 página en `ran-1-13`.

**Plantilla de exportación a PDF de LeyChile** (la versión va como `idNorma.AAAA-MM-DD`; se usaron estas):

```
https://nuevo.leychile.cl/servicios/Consulta/Exportar?radioExportar=Normas&exportar_formato=pdf&nombrearchivo=NOMBRE&exportar_con_notas_bcn=False&exportar_con_notas_originales=False&exportar_con_notas_al_pie=False&hddResultadoExportar=IDNORMA.FECHA.0.0%23
```

- Ley 20.009: `236736.2026-10-28` (devuelve la versión 30-may-2024)
- DFL 3 / Ley 19.496: `1160403.2025-07-11`
- DS 41/2012: `1041742.2026-10-28`
- Ley 21.663: `1202434.2026-10-28`
- DS 295: `1211466.2025-01-01`
- Ley 21.521: `1187323.2026-10-28`

**Índices consultados**

- Índice RAN de la CMF, con PDFs de los capítulos refundidos: https://www.cmfchile.cl/portal/normativa/624/w4-propertyvalue-49163.html
- Historial de la NCG 514 (modificada por la NCG 569): https://www.cmfchile.cl/institucional/legislacion_normativa/normativa2.php?tiponorma=NCG&numero=514&entidad_web=ALL&materia=ALL&enviado=1&hidden_mercado=%25
- Historial de la NCG 538 (modificada por las NCG 544 y 568): https://www.cmfchile.cl/institucional/legislacion_normativa/normativa2.php?tiponorma=NCG&numero=538&entidad_web=ALL&materia=ALL&enviado=1&hidden_mercado=%25
- Ficha de la Circular 2.261 (crea el capítulo 20-10; se prefiere el capítulo refundido): https://www.cmfchile.cl/portal/normativa/624/w4-article-105471.html
- Circulares interpretativas SERNAC: https://www.sernac.cl/portal/618/w3-propertyvalue-21072.html
- Dictámenes SERNAC: https://www.sernac.cl/portal/618/w3-propertyvalue-66262.html
- Página del dictamen de fraude: https://www.sernac.cl/portal/618/w3-article-88180.html

Los PDFs descargados y sus extracciones `.txt` quedaron fuera del repo, en `/private/tmp/claude-502/-Users-apiux-projects-rag-banca/226d9feb-903a-4e35-be0b-6ca8489f5896/scratchpad/corpus-check/pdf/`.
