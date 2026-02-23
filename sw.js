

const CACHE_NAME = "tyagicore-v1";

// ── Install ──────────────────────────────────────────────
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

// ── Push Event — Notification dikhao ────────────────────
self.addEventListener("push", (e) => {
  if (!e.data) return;

  let data;
  try { data = e.data.json(); }
  catch (_) { data = { title: "TyagiCore", message: e.data.text(), url: "/" }; }

  const title   = data.title   || "TyagiCore";
  const options = {
    body     : data.message || "Naya activity hua hai!",
    icon     : "/favicon.ico",        
    badge    : "/favicon.ico",
    tag      : data.tag || "tc-notif",
    data     : { url: data.url || "/" },
    vibrate  : [200, 100, 200],
    requireInteraction: false,
    actions  : [
      { action: "open",    title: "View Comment" },
      { action: "dismiss", title: "Dismiss"       }
    ]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click ───────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();

  if (e.action === "dismiss") return;

  const targetUrl = e.notification.data?.url || "/";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      // Agar tab already khuli hai — focus karo
      for (const win of wins) {
        if (win.url.includes(targetUrl) && "focus" in win) {
          return win.focus();
        }
      }
      // Nahi hai — naya tab kholo
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Push Subscription Change ─────────────────────────────
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly     : true,
      applicationServerKey: urlBase64ToUint8Array(
        "BEHWdkFA-6s7LDtjKof5GjWdAsrWqifE6VYm7EfnWJugAhbTT6MmJfdAegGrPJfu_o8sCb7qV5Ek2TbJOWPMon0"
      )
    })
  );
});

// ── Helper ───────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
