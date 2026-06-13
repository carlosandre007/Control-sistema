// Este arquivo foi intencionalmente esvaziado.
// O Service Worker é gerenciado pelo vite-plugin-pwa (Workbox).
// Este SW se auto-desregistra para evitar conflito com o SW gerado pelo Workbox.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  await self.clients.claim();
  // Limpa todos os caches antigos desta versão manual
  const keys = await caches.keys();
  await Promise.all(keys.map(key => caches.delete(key)));
});
