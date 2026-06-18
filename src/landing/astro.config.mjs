import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import packageJson from '../../package.json' with { type: 'json' };

const srcRoot = new URL('../', import.meta.url).pathname;
const landingSrcRoot = new URL('./src', import.meta.url).pathname;

export default defineConfig({
  root: new URL('../../', import.meta.url).pathname,
  srcDir: new URL('./src', import.meta.url).pathname,
  publicDir: new URL('./public', import.meta.url).pathname,
  output: 'static',
  outDir: new URL('../../dist-landing', import.meta.url).pathname,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': srcRoot,
        '@landing': landingSrcRoot,
      },
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
  },
});
