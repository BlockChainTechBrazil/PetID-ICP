import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

// Carregar .env da raiz do projeto
dotenv.config({ path: '../../.env' });

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

export default defineConfig({
  define: {
    // Garantir que as variáveis de ambiente estejam disponíveis
    'import.meta.env.REACT_APP_PINATA_JWT': JSON.stringify(process.env.REACT_APP_PINATA_JWT),
    'import.meta.env.CANISTER_ID_PETID_BACKEND': JSON.stringify(process.env.CANISTER_ID_PETID_BACKEND),
    'import.meta.env.CANISTER_ID_PETID_FRONTEND': JSON.stringify(process.env.CANISTER_ID_PETID_FRONTEND),
    'import.meta.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY),
    'import.meta.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
  },
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: isDevelopment ? {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          // Adicionar tratamento de erro para evitar falhas quando o dfx não estiver rodando
          proxy.on('error', (err, req, res) => {
            console.warn('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Backend service is unavailable. Run dfx start in a separate terminal.');
          });
        }
      },
    } : {},
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // habilita manifest e sw virtuais no modo dev
        navigateFallback: 'index.html'
      },
      includeAssets: ['favicon.ico', 'logo2.svg'],
      manifest: {
        name: 'PetID',
        short_name: 'PetID',
        description: 'Identidade digital e genealogia para seu pet na ICP',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        lang: 'pt-BR',
        icons: [
          {
            src: '/logo2.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});