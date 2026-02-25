const CACHE = "tyagicore-v2";
const STATIC = ["/", "/assets/css/style.css", "/assets/js/main.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(cached => {
    const net = fetch(e.request).then(res => {
      if(res && res.status===200){ const cl=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); }
      return res;
    }).catch(()=>cached);
    return cached || net;
  }));
});
self.addEventListener("push", e => {
  const d = e.data ? e.data.json() : {};
  const n = d.notification || {};
  e.waitUntil(self.registration.showNotification(n.title||"TyagiCore 🔔", {
    body: n.body||"", icon:"/assets/images/tyagi_core.png",
    badge:"/assets/images/tyagi_core.png",
    data:{url:(d.data&&d.data.url)||"/"}, vibrate:[200,100,200], tag:"tc"
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list => {
    for(const c of list) if(c.url===url && "focus" in c) return c.focus();
    return clients.openWindow(url);
  }));
});
