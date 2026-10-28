# Gemini API (free tier) como LLM de generación

La generación de respuestas usa la Gemini API en su free tier, tanto en desarrollo local como en la demo pública, con el modelo fijado por variable de entorno y no en el código. Se eligió sobre Claude API porque cobra por token desde la primera llamada y la suscripción de Claude no cubre uso de API, y sobre Ollama local porque la demo pública obligaría a tener el Mac encendido 24/7 o a hostear el modelo, y no hay hosting gratuito con RAM suficiente para un modelo de ~8B.

Consecuencias aceptadas:

- **Los datos pueden usarse para entrenar.** Según los términos, en el uso no pagado Google usa los prompts y respuestas para mejorar sus productos ([términos](https://ai.google.dev/gemini-api/terms)). El Corpus es normativa pública, así que el riesgo está en lo que escriban los usuarios de la demo; la demo debe avisarlo.
- **La cuota es inestable.** Google la publica sin garantía y la ha recortado sin aviso ([límites](https://ai.google.dev/gemini-api/docs/rate-limits)). Los evals deben correr con pausas entre llamadas, y la demo debe responder con un mensaje claro cuando la cuota se agote.
- **La calidad citando no está medida.** Los evals (Hit@5, Citas válidas, abstención correcta) dirán si el modelo cumple la regla de citar `[n]` o abstenerse.

La generación vive detrás de una sola función, para que cambiar de proveedor toque un archivo. Si la cuota o la calidad no alcanzan, el plan B es Claude Haiku 5.5 pagado con límite de gasto en la Console, a un costo estimado de ~USD 0,001 por pregunta.
