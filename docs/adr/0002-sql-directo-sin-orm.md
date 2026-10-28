# SQL directo con postgres.js, sin ORM

El esquema vive en migraciones SQL numeradas en `apps/api/db/migrations/` y las consultas se escriben en SQL directo con el driver `postgres` (postgres.js). Se descartó un ORM como Drizzle porque la consulta central del proyecto, la búsqueda vectorial (`ORDER BY embedding <=> $1 LIMIT 5`), es justo lo que hay que ver y entender, y porque el mismo SQL corre sin cambios en Supabase si la demo migra ahí.
