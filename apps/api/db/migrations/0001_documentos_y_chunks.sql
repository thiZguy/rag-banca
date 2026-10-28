CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documentos (
  id          text PRIMARY KEY,
  titulo      text NOT NULL,
  emisor      text NOT NULL,
  tipo        text NOT NULL,
  fecha       date NOT NULL,
  url         text NOT NULL,
  hash        text NOT NULL
);

CREATE TABLE chunks (
  id               bigserial PRIMARY KEY,
  documento_id     text NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  seccion          text NOT NULL,
  ruta             text NOT NULL,
  pagina_inicio    int  NOT NULL,
  pagina_fin       int  NOT NULL,
  orden            int  NOT NULL,
  parte            int  NOT NULL DEFAULT 0,
  texto            text NOT NULL,
  texto_embebido   text NOT NULL,
  caracteres       int  NOT NULL,
  modelo           text NOT NULL,
  embedding        vector(1024) NOT NULL,
  UNIQUE (documento_id, orden, parte)
);
