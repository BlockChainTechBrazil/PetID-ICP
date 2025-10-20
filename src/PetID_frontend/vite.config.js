import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

// Carregar .env da raiz do projeto
dotenv.config({ path: '../../.env' });
dotenv.config({ path: './.env' }); // fallback para .env local

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

export default defineConfig({
  define: {
    // Garantir que as variáveis de ambiente estejam disponíveis com prefixo VITE_
    'import.meta.env.CANISTER_ID_PETID_BACKEND': JSON.stringify(process.env.VITE_CANISTER_ID_PETID_BACKEND),
    'import.meta.env.CANISTER_ID_PETID_FRONTEND': JSON.stringify(process.env.VITE_CANISTER_ID_PETID_FRONTEND),
    'import.meta.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.VITE_CANISTER_ID_INTERNET_IDENTITY),
    'import.meta.env.DFX_NETWORK': JSON.stringify(process.env.VITE_DFX_NETWORK),
    // Expor Google Maps e OpenAI API Keys
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY),
    'import.meta.env.OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY),
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
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Backend service is unavailable. Run dfx start in a separate terminal.');
            }
          });
          
          // Interceptar requests problemáticos ANTES de enviar
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Bloquear /api/v2/status completamente
            if (req.url && req.url.includes('/api/v2/status')) {
              proxyReq.destroy();
              if (!res.headersSent) {
                res.writeHead(200, { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end('{"status":"ok"}');
              }
              return;
            }
            
            // Adicionar headers necessários para ICP
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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