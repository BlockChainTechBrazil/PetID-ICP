import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registro do Service Worker (PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    const swUrl = '/sw.js';
    try {
      const reg = await navigator.serviceWorker.register(swUrl);
      console.log('[PWA] SW registrado', reg.scope);
      
      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('[PWA] Nova versão ativa.');
          }
        });
      });
    } catch (err) {
      console.warn('[PWA] Falha ao registrar SW', err);
    }
  });
}
