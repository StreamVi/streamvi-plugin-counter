/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CENTRIFUGO_HOST: string
  readonly VITE_STREAMVI_API_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
