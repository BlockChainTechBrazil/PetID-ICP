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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const swUrl = '/sw.js';
    try {
      // Em dev, o plugin cria um SW virtual; habilitamos devOptions.enabled no vite.config.
      // Ainda assim, validamos para evitar log de erro 404 ruidoso.
      const headResp = await fetch(swUrl, { method: 'HEAD' });
      if (!headResp.ok) {
        console.info('[PWA] SW ainda não disponível (status ' + headResp.status + ').');
        return; // evita tentativa de registro quebrada
      }
      const reg = await navigator.serviceWorker.register(swUrl);
      console.log('[PWA] SW registrado', reg.scope);
    } catch (err) {
      console.warn('[PWA] Falha ao registrar SW', err);
    }
  });
}
