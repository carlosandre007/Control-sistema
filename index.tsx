import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ─── Update Notification Banner ───────────────────────────────────────────────
// Exibido quando o Workbox detecta nova versão publicada
function UpdateBanner({ onUpdate }: { onUpdate: () => void }) {
  return (
    <div
      id="update-banner"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
        fontSize: '0.875rem',
        fontWeight: 500,
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'slideUp 0.3s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '1rem' }}>🚀</span>
      <span>Nova versão disponível!</span>
      <button
        onClick={onUpdate}
        style={{
          marginLeft: '0.5rem',
          padding: '0.3rem 0.9rem',
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8rem',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
      >
        Atualizar Agora
      </button>
    </div>
  );
}

// ─── Root App with SW update awareness ────────────────────────────────────────
function Root() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Injeta animação do banner via CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    if (!('serviceWorker' in navigator)) return;

    // Ouve eventos do vite-plugin-pwa (Workbox) para detectar nova versão
    // O Workbox emite 'sw.update' via postMessage quando novo SW está esperando
    navigator.serviceWorker.ready.then(reg => {
      setRegistration(reg);

      // Detecta SW novo aguardando ativação
      const checkWaiting = (r: ServiceWorkerRegistration) => {
        if (r.waiting) {
          setNeedsUpdate(true);
        }
      };

      checkWaiting(reg);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedsUpdate(true);
          }
        });
      });
    });

    // Quando o SW troca (skipWaiting ativado), recarrega a página
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Envia mensagem para o Workbox ativar o novo SW imediatamente
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setNeedsUpdate(false);
  };

  return (
    <>
      <App />
      {needsUpdate && <UpdateBanner onUpdate={handleUpdate} />}
    </>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
