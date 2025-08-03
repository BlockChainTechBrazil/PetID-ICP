import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.CANISTER_ID_PETID_BACKEND': JSON.stringify(process.env.CANISTER_ID_PETID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai'),
    'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    'import.meta.env.VITE_DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'import.meta.env.VITE_CANISTER_ID_PETID_BACKEND': JSON.stringify(process.env.CANISTER_ID_PETID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai'),
    'import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    'import.meta.env.VITE_HOST': JSON.stringify(process.env.HOST || 'http://localhost:4943'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    include: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          dfinity: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal'],
        },
      },
    },
  },
})
