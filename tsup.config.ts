import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Change this to your entry file(s)
  format: ['cjs', 'esm'], // Output formats
  dts: true, // Generate declaration files
  sourcemap: true, // Generate source maps
  outDir: 'lib', // Output directory
  clean: true, // Clean output directory before each build
});