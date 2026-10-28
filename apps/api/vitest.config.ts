import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Los tests de integración comparten la base de test; en serie no se pisan.
    fileParallelism: false,
  },
});
