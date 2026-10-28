# Asistente normativo bancario

Asistente que responde preguntas de equipos internos de banca sobre normativa chilena pública, citando documento y sección o absteniéndose.

## Language

### Corpus

**Corpus**:
El conjunto fechado de Documentos cargados; es una foto de la normativa a una fecha, no la normativa vigente en tiempo real.
_Avoid_: base de conocimiento, dataset

**Fecha de corte**:
La fecha única a la que el Corpus refleja la normativa; es la fecha en que se descargaron sus Documentos.
_Avoid_: fecha de actualización, vigencia

**Documento**:
Un PDF concreto de normativa, con título, emisor, tipo (ley, capítulo RAN, circular, NCG), fecha y URL de origen. Se prefiere el texto refundido vigente sobre la circular que lo modifica.
_Avoid_: fuente, archivo, norma (cuando se habla del PDF)

**Documento modificatorio**:
Un Documento que reemplaza Secciones de otro Documento del Corpus que no tiene texto refundido.
_Avoid_: parche, enmienda

**Sección**:
La unidad estructural más específica y citable de un Documento (un artículo o un numeral), identificada por su número literal, como "Art. 5", "3.2" o "Anexo 1". Los incisos pertenecen a su artículo.
_Avoid_: párrafo, apartado

**Ruta de encabezados**:
La cadena de títulos que lleva desde el Documento hasta una Sección, como "Ley 21.521 > Título II > Art. 5".
_Avoid_: breadcrumb, path

**Sección reemplazada**:
Una Sección de un Documento que un Documento modificatorio dejó sin efecto; no puede respaldar una respuesta.
_Avoid_: sección derogada, sección obsoleta

**Tema**:
Un área de normativa que agrupa Documentos del Corpus, como "autenticación y fraude en transferencias".
_Avoid_: categoría, dominio

### Respuesta

**Chunk**:
Un trozo de texto de una Sección que se indexa y se recupera como unidad.
_Avoid_: fragmento, fuente, pasaje

**Cita**:
Una referencia `[n]` dentro de una respuesta que apunta a un Chunk entregado al modelo para esa pregunta.
_Avoid_: fuente, referencia

**Abstención**:
La respuesta "no encontré respaldo en la normativa cargada", que se da cuando ningún Chunk recuperado respalda una respuesta.
_Avoid_: fallback, "no sé"
