/* ═══════════════════════════════════════════
   TYAGI CORE — Service Worker v3
   ✅ Push notifications fixed for browsers
   ═══════════════════════════════════════════ */

const CACHE_NAME = "tyagicore-v3";
const STATIC_ASSETS = [
  "/",
  "/assets/css/style.css",
  "/assets/js/main.js"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.log("[SW] Install error:", err))
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* FETCH — Cache First with Network Fallback */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // Don't cache API calls or external scripts
  if (url.hostname !== location.hostname) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ═══════════════════════════════════════════
   PUSH NOTIFICATIONS — Fixed for Chrome/Firefox
   ═══════════════════════════════════════════ */
self.addEventListener("push", event => {
  let title = "Tyagi Core 🚀";
  let body  = "Nayi post aa gayi!";
  let url   = "https://tyagicore.gklearnstudy.in/";
  let icon  = "/assets/images/tyagi_core.png";
  let badge = "/assets/images/tyagi_core.png";

  if (event.data) {
    try {
      const data = event.data.json();
      // Support both {title, body, url} and {notification: {title, body}, data: {url}}
      if (data.notification) {
        title = data.notification.title || title;
        body  = data.notification.body  || body;
        icon  = data.notification.icon  || icon;
      } else {
        title = data.title || title;
        body  = data.body  || body;
      }
      url = (data.data && data.data.url) || data.url || url;
    } catch (e) {
      // If not JSON, use text directly as body
      body = event.data.text();
    }
  }

  const options = {
    body,
    icon,
    badge,
    vibrate: [200, 100, 200, 100, 200],
    tag: "tyagi-notification",
    renotify: true,
    data: { url },
    actions: [
      { action: "open",    title: "Read Now 📖" },
      { action: "dismiss", title: "Close"       }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* NOTIFICATION CLICK */
self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "https://tyagicore.gklearnstudy.in/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      // If site already open, focus that tab
      for (const client of clientList) {
        if (client.url.includes("tyagicore.gklearnstudy.in") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

/* NOTIFICATION CLOSE */
self.addEventListener("notificationclose", event => {
  // Optional: track dismissed notifications
  console.log("[SW] Notification dismissed:", event.notification.tag);
});

/* MESSAGE from page — for programmatic control */
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
