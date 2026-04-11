type RequiredEnvKey = 'VITE_STREAMVI_API_HOST' | 'VITE_CENTRIFUGO_HOST'

function readRequiredEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const config = {
  apiHost: readRequiredEnv('VITE_STREAMVI_API_HOST'),
  centrifugoHost: readRequiredEnv('VITE_CENTRIFUGO_HOST'),
}
