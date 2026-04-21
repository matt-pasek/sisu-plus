import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(__dirname, 'dist/manifest.json'),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/index': resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
        format: 'esm',
      },
    },
  },
})
