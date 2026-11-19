// packages/sdk/tsup.config.ts
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

// SDK version comes from package.json so the User-Agent / X-Client header
// can't drift from the published version.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true
    }
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2018',
  external: ['axios', 'form-data'],
  define: {
    __SDK_VERSION__: JSON.stringify(version)
  },
  platform: 'neutral',
  globalName: 'DDEXWorkbench',
  footer: {
    js: `if (typeof window !== 'undefined' && !window.DDEXWorkbench) { window.DDEXWorkbench = DDEXWorkbench; }`
  }
});