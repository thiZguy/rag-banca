# Investigación: modelo de embeddings

Fecha de acceso de todas las fuentes: 2026-10-28.

## Pregunta

¿Qué modelo de embeddings usamos para indexar y consultar normativa bancaria chilena en español (Chunks de hasta ~600 tokens más la Ruta de encabezados), con todo el código en TypeScript/Node y los vectores en Postgres + pgvector?

Candidatos comparados:

- API: Voyage AI serie 4 (`voyage-4-large`, `voyage-4`, `voyage-4-lite`) y OpenAI (`text-embedding-3-small`, `text-embedding-3-large`).
- Local en Node con transformers.js: familia `multilingual-e5` (small, base, large, large-instruct) y `voyage-4-nano` (open-weight, con build ONNX).

`voyage-multilingual-2` ya aparece como modelo de generación anterior, sin tokens gratis ([precios Voyage](https://docs.voyageai.com/docs/pricing)); Anthropic lista la serie 4 como generación actual y la describe como multilingüe ([Anthropic, Embeddings](https://platform.claude.com/docs/en/build-with-claude/embeddings)). Por eso se compara la serie 4 y no `voyage-multilingual-2`.

## Tabla comparativa

| Modelo | Dims (default / opciones) | Máx. tokens de entrada | USD / 1M tokens | Ingesta 1,5M tok | 1.000 consultas (30k tok) | Prefijos | Node/TS |
|---|---|---|---|---|---|---|---|
| `voyage-4-large` | 1024 / 256, 512, 2048 | 32.000 | 0,12 (200M gratis) | 0,18 (cubierto por free tier) | 0,0036 | `input_type` query/document | SDK oficial `voyageai` |
| `voyage-4` | 1024 / 256, 512, 2048 | 32.000 | 0,06 (200M gratis) | 0,09 (cubierto) | 0,0018 | `input_type` query/document | SDK oficial `voyageai` |
| `voyage-4-lite` | 1024 / 256, 512, 2048 | 32.000 | 0,02 (200M gratis) | 0,03 (cubierto) | 0,0006 | `input_type` query/document | SDK oficial `voyageai` |
| `text-embedding-3-small` | 1536 / `dimensions` libre | 8.192 | 0,02 | 0,03 | 0,0006 | ninguno | SDK oficial `openai` |
| `text-embedding-3-large` | 3072 / `dimensions` libre | 8.192 | 0,13 | 0,195 | 0,0039 | ninguno | SDK oficial `openai` |
| `multilingual-e5-small` | 384 / no | 512 | 0 (CPU propia) | 0 | 0 | `query: ` / `passage: ` | transformers.js (`Xenova/…`, int8 118 MB) |
| `multilingual-e5-base` | 768 / no | 512 | 0 | 0 | 0 | `query: ` / `passage: ` | transformers.js (int8 278 MB) |
| `multilingual-e5-large` | 1024 / no | 512 | 0 | 0 | 0 | `query: ` / `passage: ` | transformers.js (quantized 562 MB) |
| `voyage-4-nano` | 2048 / 256, 512, 1024 | 32.000 | 0 | 0 | 0 | prompts de Voyage | SDK `voyageai` modo local sobre transformers.js (q8 ~422 MB) |

Fuentes de la tabla: dims, contexto y precios Voyage en [docs Voyage](https://docs.voyageai.com/docs/embeddings), [precios Voyage](https://docs.voyageai.com/docs/pricing) y [Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings); OpenAI en [guía de embeddings](https://developers.openai.com/api/docs/guides/embeddings), [referencia de la API](https://developers.openai.com/api/reference/resources/embeddings/methods/create) y [precios](https://developers.openai.com/api/docs/pricing); e5 en los model cards ([small](https://huggingface.co/intfloat/multilingual-e5-small), [base](https://huggingface.co/intfloat/multilingual-e5-base), [large](https://huggingface.co/intfloat/multilingual-e5-large)); tamaños ONNX en los repos de Hugging Face citados en cada nota.

**Supuestos del costo:** el corpus completo suma ~1,5M tokens (20 PDFs de ~75k tokens) y cada consulta ~30 tokens; cada proveedor cuenta tokens con su propio tokenizador, así que la cifra real varía. Se asume que el prompt que Voyage antepone con `input_type` cuenta como tokens facturables (**no verificado**). Aun repitiendo la ingesta 10 veces por experimentos de chunking, ningún candidato API supera ~2 USD.

### Calidad de retrieval: benchmarks con números comparables

No hay un benchmark público en español que incluya a todos los candidatos. Lo más comparable son los archivos de resultados oficiales de MTEB ([embeddings-benchmark/results](https://github.com/embeddings-benchmark/results)), que alimentan el leaderboard. Métrica: nDCG@10 (`main_score`).

**MIRACL-es (tarea `MIRACLRetrievalHardNegatives`, subset `es`, split dev; Wikipedia en español):**

| Modelo | nDCG@10 es | Fuente |
|---|---|---|
| `multilingual-e5-small` | 52,98 | [results/intfloat__multilingual-e5-small/fd1525a…/MIRACLRetrievalHardNegatives.json](https://github.com/embeddings-benchmark/results/blob/main/results/intfloat__multilingual-e5-small/fd1525a9fd15316a2d503bf26ab031a61d056e98/MIRACLRetrievalHardNegatives.json) |
| `multilingual-e5-base` | 52,81 | [results/intfloat__multilingual-e5-base/d13f1b2…](https://github.com/embeddings-benchmark/results/blob/main/results/intfloat__multilingual-e5-base/d13f1b27baf31030b7fd040960d60d909913633f/MIRACLRetrievalHardNegatives.json) |
| `multilingual-e5-large` | 53,33 (v2 de la tarea) | [results/intfloat__multilingual-e5-large/ab10c1a…/MIRACLRetrievalHardNegatives.v2.json](https://github.com/embeddings-benchmark/results/blob/main/results/intfloat__multilingual-e5-large/ab10c1a7f42e74530fe7ae5be82e6d4f11a719eb/MIRACLRetrievalHardNegatives.v2.json) |
| `multilingual-e5-large-instruct` | 54,14 (v2) | [results/intfloat__multilingual-e5-large-instruct/baa7be4…](https://github.com/embeddings-benchmark/results/blob/main/results/intfloat__multilingual-e5-large-instruct/baa7be480a7de1539afce709c8f13f833a510e0a/MIRACLRetrievalHardNegatives.v2.json) |
| `text-embedding-3-large` | 51,90 | [results/openai__text-embedding-3-large/1/…](https://github.com/embeddings-benchmark/results/blob/main/results/openai__text-embedding-3-large/1/MIRACLRetrievalHardNegatives.json) |
| `text-embedding-3-small` | 51,83 (v2) | [results/openai__text-embedding-3-small/3/…](https://github.com/embeddings-benchmark/results/blob/main/results/openai__text-embedding-3-small/3/MIRACLRetrievalHardNegatives.v2.json) |
| `voyage-4-large` | 47,37 | [results/mongodb__voyage-4-large/1/…](https://github.com/embeddings-benchmark/results/blob/main/results/mongodb__voyage-4-large/1/MIRACLRetrievalHardNegatives.json) |
| `voyage-4` | 46,25 | [results/mongodb__voyage-4/1/…](https://github.com/embeddings-benchmark/results/blob/main/results/mongodb__voyage-4/1/MIRACLRetrievalHardNegatives.json) |
| `voyage-4-lite` | 45,05 | [results/mongodb__voyage-4-lite/1/…](https://github.com/embeddings-benchmark/results/blob/main/results/mongodb__voyage-4-lite/1/MIRACLRetrievalHardNegatives.json) |
| `voyage-4-nano` | sin resultado para `es` (solo `th`) | [results/mongodb__voyage-4-nano/29e841f…](https://github.com/embeddings-benchmark/results/tree/main/results/mongodb__voyage-4-nano/29e841f72aa70c2802a92aff8c6eeb23229591b0) |

Ojo con esta tabla: e5 fue fine-tuneado con datos de entrenamiento de MIRACL (16 idiomas), según su model card ([multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large)), así que en MIRACL juega en casa. Además algunas filas usan la versión 1 de la tarea y otras la v2, con revisiones del dataset distintas (`95c8db7d` y `d7d94fa4`); para e5-small y 3-large ambas versiones dan el mismo número en `es` (52,98 y 51,87 vs 51,90), lo que sugiere que el subset `es` no cambió, pero no lo verifiqué en el dataset.

**Retrieval legal y financiero no inglés (tareas RTEB, test, nDCG@10):** el grupo de 29 tareas de la carpeta de `voyage-4` coincide con los "29 datasets" de RTEB que cita el [blog de Voyage 4](https://blog.voyageai.com/2026/01/15/voyage-4/). No incluye español; es el proxy más cercano a "texto regulatorio en idioma no inglés".

| Modelo | FrenchLegal1 | GermanLegal1 | LegalQuAD (de) | French1 | German1 | EnglishFinance1 |
|---|---|---|---|---|---|---|
| `voyage-4-large` | 93,62 | 75,54 | 72,11 | 85,87 | 97,62 | 82,18 |
| `voyage-4` | 92,65 | 74,78 | 70,80 | 85,60 | 97,56 | 80,01 |
| `voyage-4-lite` | 92,13 | 72,55 | 67,72 | 84,50 | 96,58 | 77,22 |
| `text-embedding-3-large` | 70,05 | 66,65 | 56,34 | 80,50 | 97,53 | 70,16 |
| `text-embedding-3-small` | 62,91 | 61,80 | 54,81 | 82,46 | 95,88 | 67,31 |
| `multilingual-e5-large-instruct` | 51,09 | 64,10 | 51,25 | 80,70 | 95,77 | 68,56 |
| `multilingual-e5-small` | 35,97 | 58,30 | 47,80 | 78,66 | 86,70 | 68,14 |
| `multilingual-e5-large` | – | – | 43,17 | – | – | – |
| `multilingual-e5-base` | – | – | 47,85 | – | – | – |

Fuentes: archivos `<Tarea>.json` en [results/mongodb__voyage-4/1](https://github.com/embeddings-benchmark/results/tree/main/results/mongodb__voyage-4/1), [voyage-4-large/1](https://github.com/embeddings-benchmark/results/tree/main/results/mongodb__voyage-4-large/1), [voyage-4-lite/1](https://github.com/embeddings-benchmark/results/tree/main/results/mongodb__voyage-4-lite/1), [text-embedding-3-large/3](https://github.com/embeddings-benchmark/results/tree/main/results/openai__text-embedding-3-large/3), [text-embedding-3-small/3](https://github.com/embeddings-benchmark/results/tree/main/results/openai__text-embedding-3-small/3), [e5-large-instruct/baa7be4…](https://github.com/embeddings-benchmark/results/tree/main/results/intfloat__multilingual-e5-large-instruct/baa7be480a7de1539afce709c8f13f833a510e0a), [e5-small/fd1525a…](https://github.com/embeddings-benchmark/results/tree/main/results/intfloat__multilingual-e5-small/fd1525a9fd15316a2d503bf26ab031a61d056e98), [e5-large/ab10c1a…](https://github.com/embeddings-benchmark/results/tree/main/results/intfloat__multilingual-e5-large/ab10c1a7f42e74530fe7ae5be82e6d4f11a719eb), [e5-base/d13f1b2…](https://github.com/embeddings-benchmark/results/tree/main/results/intfloat__multilingual-e5-base/d13f1b27baf31030b7fd040960d60d909913633f). Las revisiones del dataset coinciden entre modelos en cada tarea. Los resultados de Voyage los registró `mongodb` (el propio proveedor) con `framework: API`, según `model_meta.json`.

**Belebele (spa_Latn, test):** e5-large 95,53; 3-large 94,91; e5-base 94,19; e5-large-instruct 94,19; e5-small 92,70; 3-small 92,56 ([results/…/BelebeleRetrieval.json](https://github.com/embeddings-benchmark/results/tree/main/results)). Está saturado cerca de 95 y no tiene resultado para la serie 4 de Voyage, así que no discrimina.

**Otros números publicados, no comparables entre sí:**

- Paper de mE5: MIRACL dev `es` nDCG@10 51,2 (small), 51,5 (base), 52,9 (large), 53,7 (large-instruct); promedio 16 idiomas 60,8 / 62,3 / 66,5 / 65,7 ([arXiv 2402.05672, tabla 6](https://arxiv.org/html/2402.05672v1)).
- Paper MMTEB, MTEB(Multilingual), columna Retrieval: e5-small 49,3; e5-base 52,7; e5-large 54,1; e5-large-instruct 57,1 ([arXiv 2502.13595, tabla 2](https://arxiv.org/html/2502.13595)). Esa tabla no incluye OpenAI ni Voyage.
- OpenAI: la guía da MTEB promedio 62,3 % (small) y 64,6 % (large) ([guía OpenAI](https://developers.openai.com/api/docs/guides/embeddings)). El promedio MIRACL de 44,0 (small) y 54,9 (large) viene del anuncio de enero de 2024, que devolvió HTTP 403 al consultarlo; solo lo vi en fuentes secundarias ([Pinecone](https://www.pinecone.io/learn/openai-embeddings-v3/)): **no verificado en fuente primaria**.
- Voyage: el blog dice que `voyage-4-large` supera a `voyage-4`, `voyage-4-lite` y "OpenAI v3 Large" en 1,87 %, 4,80 % y 14,05 % en promedio sobre RTEB, pero los valores absolutos solo están en gráficos ([blog Voyage 4](https://blog.voyageai.com/2026/01/15/voyage-4/)). Ni el blog ni la página del modelo listan idiomas o resultados en español; la doc solo dice que los modelos son "inherently multilingual" ([MongoDB, text embeddings](https://www.mongodb.com/docs/voyageai/models/text-embeddings/)).

### Límites de pgvector

El tipo `vector` admite hasta 16.000 dimensiones, pero HNSW e IVFFlat indexan `vector` solo hasta 2.000; `halfvec` hasta 4.000 y `bit` hasta 64.000 ([pgvector README](https://github.com/pgvector/pgvector)). Consecuencia: `text-embedding-3-large` (3072) y cualquier modelo a 2048 dims necesitan reducir dimensiones o guardarse como `halfvec` para tener índice; 1024 o 1536 entran directo en `vector`.

## Notas por candidato

### Voyage AI serie 4 (`voyage-4-large`, `voyage-4`, `voyage-4-lite`)

- Anthropic no tiene modelo de embeddings propio y presenta a Voyage AI como proveedor; para uso general recomienda `voyage-4-large` (mejor calidad), `voyage-4` (balance) y `voyage-4-lite` (menor latencia y costo) ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings)).
- Contexto de 32.000 tokens; dims 1024 por defecto con 256, 512 y 2048 vía Matryoshka (`output_dimension`); `output_dtype` float, int8, uint8, binary, ubinary ([docs Voyage](https://docs.voyageai.com/docs/embeddings), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings)). Los vectores vienen normalizados a largo 1, así que coseno y producto punto ordenan igual ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings)).
- `input_type`: `query` antepone "Represent the query for retrieving supporting documents: " y `document` antepone "Represent the document for retrieval: ". Anthropic indica no omitirlo en retrieval ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings)).
- Los cuatro modelos de la serie 4 (incluido nano) comparten espacio de embeddings: se pueden indexar documentos con `voyage-4-large` y consultar con un modelo más chico sin re-vectorizar ([blog Voyage 4](https://blog.voyageai.com/2026/01/15/voyage-4/)).
- Precio: 0,12 / 0,06 / 0,02 USD por millón; 200M tokens gratis por modelo; Batch API con 33 % de descuento, pero sin free tokens ([precios Voyage](https://docs.voyageai.com/docs/pricing), [rate limits](https://www.mongodb.com/docs/voyageai/management/rate-limits/)). No encontré si los 200M son únicos o se renuevan: **no verificado**.
- Rate limits Tier 1: `voyage-4-large` 3M TPM y 2.000 RPM; `voyage-4` 8M TPM ([rate limits](https://www.mongodb.com/docs/voyageai/management/rate-limits/)). Pasar a Tier 1 requiere registrar un medio de pago ([billing](https://www.mongodb.com/docs/voyageai/management/billing/)); los límites antes de eso no están publicados (**no verificado**).
- Node/TS: SDK oficial `npm install voyageai` (`VoyageAIClient`); con API key de Atlas hay que pasar `environment: "https://ai.mongodb.com/v1"` ([MongoDB, clientes](https://www.mongodb.com/docs/voyageai/api-and-clients/)). Los parámetros TS son `inputType`, `outputDimension`, `outputDtype` y `truncation` ([EmbedRequest.ts](https://github.com/voyage-ai/typescript-sdk/blob/main/src/api/client/requests/EmbedRequest.ts)). Versión en npm: 0.4.0 (`npm view voyageai version`).
- Calidad: lidera con claridad las tareas legales y financieras en francés y alemán, y queda debajo de e5 y OpenAI en MIRACL-es (ver tablas arriba).

### OpenAI (`text-embedding-3-small`, `text-embedding-3-large`)

- Dims por defecto 1536 (small) y 3072 (large); el parámetro `dimensions` los acorta porque ambos se entrenaron para eso ([guía OpenAI](https://developers.openai.com/api/docs/guides/embeddings), [referencia API](https://developers.openai.com/api/reference/resources/embeddings/methods/create)).
- Máx. 8.192 tokens por input, hasta 2.048 inputs por request y 300.000 tokens por request ([referencia API](https://developers.openai.com/api/reference/resources/embeddings/methods/create)).
- Precio: 0,02 (small) y 0,13 (large) USD por millón ([precios OpenAI](https://developers.openai.com/api/docs/pricing)). La página de precios no lista free tier ni tarifa batch para embeddings; que no exista free tier es **no verificado**.
- Sin prefijos de consulta o documento: la API no tiene un parámetro equivalente a `input_type` ([referencia API](https://developers.openai.com/api/reference/resources/embeddings/methods/create)).
- Node/TS: SDK oficial `openai` (v7.45.1 en npm, `npm view openai version`).
- Para pgvector: `text-embedding-3-large` a 3072 excede el límite de índice de `vector`; hay que usar `dimensions` ≤ 2000 o `halfvec`.

### `multilingual-e5` (small, base, large, large-instruct) vía transformers.js

- Dims 384 (small, 12 capas), 768 (base, 12 capas), 1024 (large y large-instruct, 24 capas); sin Matryoshka. Licencia MIT ([small](https://huggingface.co/intfloat/multilingual-e5-small), [base](https://huggingface.co/intfloat/multilingual-e5-base), [large](https://huggingface.co/intfloat/multilingual-e5-large), [large-instruct](https://huggingface.co/intfloat/multilingual-e5-large-instruct)).
- **Límite crítico:** "Long texts will be truncated to at most 512 tokens" ([model card large](https://huggingface.co/intfloat/multilingual-e5-large)). Nuestros Chunks de ~600 tokens más la Ruta de encabezados se truncarían, y lo que se pierde es justo el final del Chunk; habría que bajar el Chunk a ~450 tokens del tokenizador de XLM-R.
- Prefijos obligatorios `query: ` y `passage: `; el model card advierte degradación si se omiten ([base](https://huggingface.co/intfloat/multilingual-e5-base)). large-instruct usa `Instruct: {tarea}\nQuery: {consulta}` en la consulta y nada en el documento ([large-instruct](https://huggingface.co/intfloat/multilingual-e5-large-instruct)).
- transformers.js corre en Node 20+ (ESM o CommonJS) y cachea modelos en disco, configurable con `env.cacheDir` ([tutorial Node](https://huggingface.co/docs/transformers.js/tutorials/node)). Paquete `@huggingface/transformers` v4.3.2 ([README](https://github.com/huggingface/transformers.js)); `dtype` q8 es el default en WASM/CPU ([docs](https://huggingface.co/docs/transformers.js/index)).
- Builds ONNX para transformers.js: [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx) (int8 118 MB, fp32 470 MB), [Xenova/multilingual-e5-base](https://huggingface.co/Xenova/multilingual-e5-base/tree/main/onnx) (int8 278 MB, fp32 1,11 GB), [Xenova/multilingual-e5-large](https://huggingface.co/Xenova/multilingual-e5-large/tree/main/onnx) (quantized 562 MB, fp32 2,24 GB). large-instruct trae carpeta `onnx` oficial de 2,26 GB ([intfloat/…/onnx](https://huggingface.co/intfloat/multilingual-e5-large-instruct/tree/main/onnx)), pero no encontré un build marcado para transformers.js de un publicador confiable (**no verificado** que corra en transformers.js).
- Latencia en CPU: ni los model cards ni la doc de transformers.js publican números (**no documentado**). Si se elige esta vía, hay que medirla.
- Calidad: el mejor en MIRACL-es, con la ventaja de haber entrenado con MIRACL; claramente peor que Voyage y OpenAI en las tareas legales y financieras.

### `voyage-4-nano` (local)

- Open-weight, Apache 2.0, 180M parámetros no-embedding + 160M de embedding; 2048 dims por defecto con 1024, 512 y 256; contexto de 32.000; usa los mismos prompts de consulta y documento de Voyage ([model card](https://huggingface.co/voyageai/voyage-4-nano), [Anthropic](https://platform.claude.com/docs/en/build-with-claude/embeddings)).
- El SDK TypeScript oficial de Voyage trae un modo local para `voyage-4-nano`: carga `onnx-community/voyage-4-nano-ONNX` con `@huggingface/transformers` (peer dependency, junto a `onnxruntime-node`) ([model-registry.ts](https://github.com/voyage-ai/typescript-sdk/blob/main/src/local/model-registry.ts), [local-embedder.ts](https://github.com/voyage-ai/typescript-sdk/blob/main/src/local/local-embedder.ts), [package.json](https://github.com/voyage-ai/typescript-sdk/blob/main/package.json)). El embedder local pide `dtype: "fp32"` (1,41 GB); hay variantes quantized de 422 MB y q4 de 243 MB ([onnx-community/voyage-4-nano-ONNX](https://huggingface.co/onnx-community/voyage-4-nano-ONNX/tree/main/onnx)).
- Comparte espacio con la serie 4: sirve para embeber consultas localmente contra documentos indexados con `voyage-4-large` ([blog Voyage 4](https://blog.voyageai.com/2026/01/15/voyage-4/)).
- No hay resultados en español en MTEB ni latencia de CPU publicada (**no documentado**).

## Recomendación

**`voyage-4-large` a 1024 dimensiones (`vector(1024)` con índice HNSW, distancia coseno), con `inputType: "document"` en la ingesta y `inputType: "query"` en la consulta.**

Razón en una frase: es el que mejor rinde en retrieval legal y financiero en idiomas distintos del inglés, sus 32k tokens de contexto aceptan nuestros Chunks sin truncar, y el corpus completo más la demo cuestan menos del 1 % de los 200M tokens gratis.

Matices:

- Su resultado en MIRACL-es (Wikipedia) es peor que el de e5 y OpenAI, y no hay benchmark público de normativa en español. La decisión hay que confirmarla con nuestro propio Hit@5 sobre `evals/questions.json`. Como base de comparación barata, conviene correr también `text-embedding-3-small` (o e5 con Chunks de menos de 512 tokens).
- Si la demo pública no debe depender de una API key en tiempo de consulta, se pueden embeber las consultas con `voyage-4-nano` local a 1024 dims sin re-indexar, ya que comparte espacio con la serie 4 ([blog Voyage 4](https://blog.voyageai.com/2026/01/15/voyage-4/)). Eso queda para "después del MVP".
- Se descarta e5 como opción principal por el truncado a 512 tokens y por su caída en las tareas legales.

## Afirmaciones no verificadas o no documentadas

- Promedio MIRACL de OpenAI (44,0 / 54,9): el anuncio primario devolvió 403; solo lo vi en fuentes secundarias.
- Si los 200M tokens gratis de Voyage son únicos o se renuevan, y los rate limits antes de registrar un medio de pago.
- Si el prompt de `input_type` de Voyage se factura como tokens.
- Que OpenAI no tenga free tier para embeddings (su página de precios no lo menciona).
- Latencia de CPU para e5 y `voyage-4-nano` en transformers.js: no publicada.
- Soporte de `multilingual-e5-large-instruct` en transformers.js.
- Idiomas cubiertos por la serie 4 de Voyage: no hay lista pública, solo "multilingual".
- Que las revisiones `95c8db7d` y `d7d94fa4` del dataset MIRACL HardNegatives tengan el mismo subset `es`.

## Fuentes

- Anthropic, Embeddings: https://platform.claude.com/docs/en/build-with-claude/embeddings
- Voyage AI, Text embeddings: https://docs.voyageai.com/docs/embeddings
- Voyage AI, Pricing: https://docs.voyageai.com/docs/pricing
- Voyage AI, blog Voyage 4: https://blog.voyageai.com/2026/01/15/voyage-4/
- MongoDB, Voyage text embeddings: https://www.mongodb.com/docs/voyageai/models/text-embeddings/
- MongoDB, Voyage API y clientes: https://www.mongodb.com/docs/voyageai/api-and-clients/
- MongoDB, Voyage billing: https://www.mongodb.com/docs/voyageai/management/billing/
- MongoDB, Voyage rate limits: https://www.mongodb.com/docs/voyageai/management/rate-limits/
- Voyage TypeScript SDK: https://github.com/voyage-ai/typescript-sdk
- Hugging Face, voyage-4-nano: https://huggingface.co/voyageai/voyage-4-nano
- Hugging Face, voyage-4-nano ONNX: https://huggingface.co/onnx-community/voyage-4-nano-ONNX/tree/main/onnx
- OpenAI, guía de embeddings: https://developers.openai.com/api/docs/guides/embeddings
- OpenAI, referencia de la API de embeddings: https://developers.openai.com/api/reference/resources/embeddings/methods/create
- OpenAI, precios: https://developers.openai.com/api/docs/pricing
- Pinecone, OpenAI embeddings v3 (fuente secundaria): https://www.pinecone.io/learn/openai-embeddings-v3/
- Hugging Face, intfloat/multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
- Hugging Face, intfloat/multilingual-e5-base: https://huggingface.co/intfloat/multilingual-e5-base
- Hugging Face, intfloat/multilingual-e5-large: https://huggingface.co/intfloat/multilingual-e5-large
- Hugging Face, intfloat/multilingual-e5-large-instruct: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Hugging Face, Xenova ONNX builds: https://huggingface.co/Xenova/multilingual-e5-small, https://huggingface.co/Xenova/multilingual-e5-base, https://huggingface.co/Xenova/multilingual-e5-large
- Wang et al., Multilingual E5 Text Embeddings: A Technical Report: https://arxiv.org/html/2402.05672v1
- Paper MMTEB (arXiv 2502.13595): https://arxiv.org/html/2502.13595
- MTEB results repo: https://github.com/embeddings-benchmark/results
- transformers.js docs: https://huggingface.co/docs/transformers.js/index
- transformers.js, tutorial Node: https://huggingface.co/docs/transformers.js/tutorials/node
- transformers.js README: https://github.com/huggingface/transformers.js
- pgvector README: https://github.com/pgvector/pgvector
