import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
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