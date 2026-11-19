// packages/sdk/vitest.config.ts
import { readFileSync } from "fs";
import { defineConfig } from "vitest/config";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

export default defineConfig({
  define: {
    __SDK_VERSION__: JSON.stringify(version),
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
