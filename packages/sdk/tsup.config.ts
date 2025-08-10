// packages/sdk/tsup.config.ts
import { defineConfig } from 'tsup';

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
  platform: 'neutral',
  globalName: 'DDEXWorkbench',
  footer: {
    js: `if (typeof window !== 'undefined' && !window.DDEXWorkbench) { window.DDEXWorkbench = DDEXWorkbench; }`
  }
});