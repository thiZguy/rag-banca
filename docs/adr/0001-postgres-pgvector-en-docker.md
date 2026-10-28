# Postgres + pgvector en Docker como almacén vectorial

Los Chunks y sus embeddings viven en Postgres con la extensión pgvector, levantado con Docker Compose en local. Se eligió sobre Supabase gestionado porque cuesta cero y enseña más, y sobre JSON/SQLite en memoria porque no escala ni sirve para la demo. Como Supabase usa el mismo Postgres + pgvector, migrar en la Semana 4 no reescribe esquema ni consultas; el hosting de la demo queda abierto hasta entonces.
