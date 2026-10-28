# Plan: Asistente normativo bancario (RAG)

Oct 28, 2026 · @Santiago

## Objetivo y alcance

En 4 semanas, una app web React + TypeScript que responde preguntas sobre normativa bancaria chilena **citando documento y sección**, con evals que demuestran que funciona. Es pieza de portafolio para clientes de banca y el vehículo para aprender RAG y agentic engineering.

**Dentro del alcance (MVP):**

- Corpus de 10 a 20 documentos públicos (CMF, Ley Fintec, circulares), en PDF.
- Ingesta: extracción de texto, chunking, embeddings y almacenamiento vectorial.
- Chat con respuestas en streaming y panel de citas con el fragmento fuente.
- Si no hay fuente suficiente, responde "no encontré respaldo en la normativa cargada".
- Set de evals de 25 preguntas y un script que mide la calidad de retrieval.
- Demo desplegada y README con arquitectura y decisiones.

**Criterio de éxito:** que una persona de banca abra la demo, haga 3 preguntas reales y pueda verificar cada respuesta en la fuente citada.

## Usuario objetivo

El usuario es **interno del banco**: equipos de producto, desarrollo, QA y cumplimiento que necesitan consultar normativa rápido, sin leer la circular completa. Ejemplo: un PO pregunta qué exige la CMF para autenticar una transferencia antes de diseñar el flujo.

**Por qué interno y no cliente final:**

- **El corpus calza:** la normativa CMF le sirve a quien construye productos bancarios; al cliente final le interesan sus productos, que requieren documentos propios del banco.
- **Menor riesgo:** un empleado verifica la respuesta en la cita; a un cliente puede leérsele como asesoría.
- **Mejor venta:** una herramienta interna que ahorra tiempo a los equipos es el tipo de proyecto que contratan los bancos.

## Arquitectura y stack

Dos flujos que comparten un almacén vectorial: la ingesta corre una vez por corpus y la consulta en cada pregunta. Todo en TypeScript, para que front, API, ingesta y evals vivan en el mismo lenguaje.

&#91;embedded content: arquitectura RAG · ingesta y consulta\]

El almacén es Postgres + pgvector en Docker local; el hosting de la demo se decide en la Semana 4.

| Capa | Elección | Nota |
| --- | --- | --- |
| Front | React + TypeScript + Vite | Streaming de la respuesta y panel de citas |
| API | Node + TypeScript (Hono o Express) | Un endpoint: `POST /api/ask` |
| Embeddings | Modelo multilingüe, a elegir con `/research` | Debe rendir bien en español |
| LLM | Gemini API, free tier (ADR 0005) | Prompt que exige citar `[n]` o abstenerse; plan B: Claude Haiku 5.5 pagado |
| Almacén | Postgres + pgvector en Docker local | Decidido; se registra como ADR en la Semana 1 |

### Decisión: almacenamiento vectorial

| Opción | A favor | En contra |
| --- | --- | --- |
| Postgres + pgvector en Docker local | Costo cero; mismo SQL que Supabase, así que migrar después no reescribe nada | Para la demo pública igual hay que hostear Postgres |
| Supabase (Postgres + pgvector) | Gestionado, con deploy y funciones incluidos; pgvector es estándar en la industria | Dependes de un servicio externo y de los límites de su plan gratuito |
| JSON o SQLite en memoria | Lo más simple; calculas la similitud coseno a mano y la entiendes | No escala y no sirve para la demo |

**Decidido:** partir con Postgres + pgvector en Docker. Es la opción que más enseña y no te amarra: si después eliges Supabase, el esquema y las consultas son los mismos. La decisión de hosting queda para la Semana 4.

## Flujo de trabajo con Claude Code

Cada feature pasa por el mismo ciclo de skills: primero alinearse, después especificar, después implementar con tests. Ese ciclo, documentado en el README, es lo que muestra el "frontend senior que usa IA". Fuente: [mattpocock/skills](https://github.com/mattpocock/skills).

**Setup (una vez):**

1. `claude plugin install mattpocock-skills@claude-plugins-official`
2. En el repo, correr `/setup-matt-pocock-skills`. Como issue tracker, usa GitHub Issues: deja visible el proceso en el portafolio.

**Ciclo por feature:**

1. `/grill-with-docs` — el agente te interroga sobre la feature y va construyendo `GLOSSARY.md` y ADRs. Aquí quedan fijados términos como *chunk*, *cita*, *fuente* y *corpus*.
2. `/to-spec` — convierte la conversación en un spec publicado como issue.
3. `/to-tickets` — parte el spec en tickets chicos con dependencias.
4. `/implement` — implementa ticket a ticket, con `/tdd` (red-green-refactor) y `/code-review` antes de cada commit.
5. `/retro` — al cierre de cada semana, para mejorar `CLAUDE.md`, checks y convenciones.

**Skills de apoyo, solo cuando hagan falta:**

- `/teach` — para aprender los conceptos de RAG (embeddings, chunking, re-ranking) antes de codearlos. Clave, porque la meta es aprender, no solo entregar.
- `/research` — para decisiones con fuentes (tamaño de chunk, modelo de embeddings). Deja un Markdown citado en el repo.
- `/prototype` — para probar 2 o 3 variantes de UI del panel de citas antes de elegir.
- `/improve-codebase-architecture` — una vez por semana, para no terminar con una bola de barro.

**Regla personal:** tú revisas y entiendes cada PR antes del merge. Si no puedes explicar un cambio, no se mergea.

## Plan semana a semana

Cuatro semanas, un entregable verificable por semana. Si una semana se alarga, se recorta alcance, no se mueve la fecha.

### Semana 1 — Ingesta y retrieval por CLI

- [ ] Crear repo, instalar skills y correr `/setup-matt-pocock-skills`.
- [ ] `/teach` sobre fundamentos de RAG: embeddings, similitud coseno, chunking.
- [ ] Levantar Postgres + pgvector con Docker Compose y registrar la decisión como ADR.
- [ ] Elegir y descargar 10 a 20 documentos públicos a `corpus/raw/`.
- [ ] Script de ingesta: PDF → texto → chunks con metadata (documento, sección, página).
- [ ] Generar embeddings y guardarlos.
- [ ] CLI `ask "pregunta"` que imprime los 5 chunks más cercanos con su fuente.

**Terminado cuando:** para 5 preguntas escritas a mano, el chunk correcto aparece entre los 5 primeros en al menos 4.

### Semana 2 — Respuesta generada y front React

- [ ] Endpoint `POST /api/ask`: retrieval + prompt con los chunks + respuesta del LLM en streaming.
- [ ] Prompt que obliga a citar `[n]` y a decir "no encontré respaldo" si no hay fuente.
- [ ] App React + TypeScript + Vite: input, respuesta en streaming, estados de carga y error.
- [ ] Panel de citas: cada `[n]` abre el fragmento fuente con documento y sección.
- [ ] `/prototype` con 2 variantes del panel de citas antes de elegir una.

**Terminado cuando:** haces una pregunta en el navegador y puedes verificar la respuesta en la cita sin salir de la app.

### Semana 3 — Evals y mejora de calidad

- [ ] Escribir el set de evals (ver sección Evals).
- [ ] Script `npm run eval` que reporta las métricas en consola y en un JSON versionado.
- [ ] Medir la línea base.
- [ ] Probar una mejora a la vez y medir: tamaño de chunk, overlap, búsqueda híbrida (vector + texto).
- [ ] Dejar cada experimento como ADR corto: qué se probó, qué número cambió, qué se quedó.

**Terminado cuando:** tienes una tabla en el README con la línea base y la mejor configuración, con sus números.

### Semana 4 — Deploy y vitrina

- [ ] Deploy del front y del backend, con límite de uso para no quemar la API key.
- [ ] README: qué es, demo, diagrama de arquitectura, decisiones (ADRs), resultados de evals, flujo de trabajo con skills.
- [ ] Grabar un video de 2 minutos con 3 preguntas reales.
- [ ] Post en LinkedIn: qué construiste, qué aprendiste y un número de los evals.
- [ ] `/retro` final y lista de próximos pasos.

**Terminado cuando:** alguien externo usa la demo sin que tú le expliques nada.

## Evals

Un set de 25 preguntas en `evals/questions.json`, escritas por ti leyendo los documentos, es lo que convierte el proyecto en algo defendible frente a un cliente.

**Formato de cada caso:**

```json
{
  "id": "q07",
  "pregunta": "¿Qué plazo tiene el banco para responder un reclamo?",
  "doc_esperado": "circular-xxxx.pdf",
  "seccion_esperada": "3.2",
  "debe_responder": true
}
```

**Mezcla del set:** 15 preguntas directas, 5 que requieren combinar dos fragmentos y 5 cuya respuesta no está en el corpus (`debe_responder: false`).

| Métrica | Qué mide | Cómo se calcula |
| --- | --- | --- |
| Hit@5 | Si el retrieval encuentra la fuente | % de casos con el doc y sección esperados entre los 5 primeros chunks |
| Citas válidas | Si la respuesta cita algo real | % de respuestas cuyas citas `[n]` existen entre los chunks entregados |
| Abstención correcta | Si sabe decir "no sé" | % de casos `debe_responder: false` donde responde "no encontré respaldo" |

Las tres se calculan con código, sin un LLM como juez. La calidad de redacción no se mide en el MVP: se revisa a mano en 5 casos.

## Estructura del repo y primer prompt

Un monorepo simple con dos apps y una carpeta de datos; nada de paquetes compartidos hasta que hagan falta.

```
asistente-normativo/
├── apps/
│   ├── web/          # React + TypeScript + Vite
│   └── api/          # Node + TypeScript: /api/ask, ingesta, evals
├── corpus/
│   └── raw/          # PDFs originales
├── evals/
│   └── questions.json
├── docs/
│   └── adr/          # decisiones de arquitectura
├── GLOSSARY.md       # lo genera /grill-with-docs
├── CLAUDE.md
└── README.md
```

**Primer mensaje a Claude Code** (después del setup de skills):

```markdown
/grill-with-docs

Voy a construir un asistente RAG sobre normativa bancaria chilena (CMF, Ley Fintec).
El plan completo está en docs/PLAN.md. Empezamos por la Semana 1: ingesta y retrieval por CLI.
Antes de escribir código, interrógame para cerrar: almacenamiento vectorial,
estrategia de chunking, metadata de cada chunk y formato de salida del CLI.
Mi objetivo también es aprender RAG: explícame cada decisión en una frase.
```

Exporta este documento a Markdown y déjalo como `docs/PLAN.md` para que el agente lo lea.

## Riesgos y fuera de alcance

| Riesgo | Mitigación |
| --- | --- |
| PDFs con tablas o escaneados que se extraen mal | Elegir documentos con texto seleccionable; descartar los que no |
| La normativa cambia y la demo queda desactualizada | Mostrar la fecha de cada documento en la cita; el corpus es una foto fechada |
| Costo de API en la demo pública | Gemini free tier (costo cero) y límite de preguntas por IP |
| La cuota gratuita de Gemini se agota o se recorta sin aviso | Mensaje claro al usuario; plan B: Claude Haiku 5.5 con límite de gasto |
| En el free tier, Google usa prompts y respuestas para entrenar | Aviso visible en la demo: no ingresar datos confidenciales |
| Perder foco agregando features | Lo que no está en el plan va a una lista de "después del MVP" |
| Que parezca asesoría legal | Aviso visible: herramienta de consulta, no reemplaza revisión legal |

**Fuera de alcance del MVP:** login y usuarios, subir documentos propios, historial de conversaciones, re-ranking con modelo dedicado, LLM como juez en los evals y app móvil. Son buenos candidatos para una versión 2.
