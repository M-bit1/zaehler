const V='zaehler-v2';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  const save=res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp))}return res};
  // App-Seite: zuerst aus dem Netz (Updates kommen sofort an), offline aus dem Cache
  if(e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html')){
    e.respondWith(fetch(e.request).then(save).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match('./'))));
    return;
  }
  // Icons usw.: aus dem Cache, im Hintergrund aktualisieren
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(save).catch(()=>hit);
    return hit||net;
  }));
});
