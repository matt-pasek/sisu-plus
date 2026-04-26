/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHROME_WEB_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}
