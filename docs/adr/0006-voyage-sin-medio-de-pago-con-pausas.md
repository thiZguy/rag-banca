# Voyage sin medio de pago, con lotes y pausas

El proyecto debe costar $0 garantizado, así que la cuenta de Voyage no tiene medio de pago. Voyage regala 200M de tokens por cuenta y después cobra $0,12 por millón, pero no documenta ningún tope de gasto ni alerta, así que una tarjeta deja abierta la posibilidad de un cobro (una API key filtrada, un loop) ([precios](https://docs.voyageai.com/docs/pricing)). Sin medio de pago, la cuenta queda limitada a 3 requests y 10K tokens por minuto. La ingesta del Corpus son ~130K tokens, y un solo lote de 64 Chunks de una ley larga ya pasa ese tope.

El embedder de Voyage arma lotes de hasta ~9K tokens (estimados como caracteres / 3, que en español sobreestima) y deja un minuto entre un request y el siguiente, aunque estén en llamadas distintas. Se descartó cambiar a un modelo local (`bge-m3`), porque obliga a reemplazar ADR 0003 y a cargar el modelo en la API desplegada. También se descartaron los embeddings de Gemini, porque sus límites gratis no están publicados y igual requieren pausas.

Consecuencias aceptadas:

- **Ingestar tarda.** Las 4 leyes y decretos (213 Chunks) tardaron 23 minutos el 29-oct-2026, y el Corpus completo tardará más cuando la RAN y las NCG tengan reglas de Secciones. Hasta la ingesta idempotente (#7), cada `npm run ingest` re-embebe todo; después, solo los Documentos que cambiaron pagan ese tiempo.
- **Una pregunta no espera.** La consulta es un request de un texto, y solo espera si hubo otro request del mismo proceso en el último minuto. `eval:retrieval` embebe todas sus preguntas en un solo request.
- **Comparar modelos de embeddings en la Semana 3 solo puede usar modelos con free tier sin tarjeta.** Esto reemplaza la comparación contra `text-embedding-3-small` de ADR 0003, que es pagado.
