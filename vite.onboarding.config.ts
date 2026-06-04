import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import packageJson from './package.json';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    rollupOptions: {
      input: { onboarding: resolve(__dirname, 'onboarding.html') },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
