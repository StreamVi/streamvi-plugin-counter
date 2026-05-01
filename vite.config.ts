import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function stripStreamviUiEmbeddedFonts() {
  return {
    name: 'strip-streamvi-ui-embedded-fonts',
    transform(code: string, id: string) {
      if (!id.includes('@streamvi/streamvi-ui') || !id.endsWith('/style.css')) {
        return null
      }

      const css = code.replace(
        /@font-face\{[^{}]*?data:font\/woff2;base64,[^{}]*?\}/g,
        '',
      )

      return {
        code: css,
        map: null,
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT || '5511')

  return {
    plugins: [stripStreamviUiEmbeddedFonts(), react()],
    server: {
      port,
      strictPort: true,
    },
    preview: {
      port,
      strictPort: true,
    },
  }
})
