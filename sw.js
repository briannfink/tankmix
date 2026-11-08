// One-time migration worker at the OLD /tankmix/sw.js address.
// Offline caches are disposable; NEVER touch localStorage/IndexedDB or Auth/session data.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).map(key => caches.delete(key)));
  await self.clients.claim();
  const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await self.registration.unregister();
  await Promise.all(windows.map(async client => {
    const next = new URL(client.url);
    if(next.origin !== self.location.origin || !/^\/tankmix(?:\/|$)/.test(next.pathname))return;
    next.pathname = next.pathname.replace(/^\/tankmix(?=\/|$)/, '/spraytrue');
    try { await client.navigate(next.href); } catch(error) { /* HTML redirect handles the next launch. */ }
  }));
})()));
// No fetch handler: the retired scope must not serve stale application HTML.
