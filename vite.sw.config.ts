import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: { 'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts') },
      output: {
        entryFileNames: '[name].js',
        format: 'esm',
      },
    },
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));
      },
    },
  ],
});
