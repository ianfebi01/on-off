import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig( ( { mode } ) => {
  const env = loadEnv( mode, process.cwd(), '' )
  const apiTarget = env.VITE_API_TARGET || 'https://bulb-api.ianfebisastrataruna.my.id'

  return {
    plugins : [
      tanstackRouter( {
        target            : 'react',
        autoCodeSplitting : true,
      } ),
      react(),
      tailwindcss(),
    ],
    resolve : {
      alias : {
        '@' : fileURLToPath( new URL( './src', import.meta.url ) ),
      },
    },
    server : {
      proxy : {
        '/v1' : {
          target              : apiTarget,
          changeOrigin        : true,
          secure              : true,
          cookieDomainRewrite : '',
        },
        '/bulb' : {
          target              : apiTarget,
          changeOrigin        : true,
          secure              : true,
          cookieDomainRewrite : '',
        },
      },
    },
  }
} )
