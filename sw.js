// ============================================================
//   TYAGICORE — SERVICE WORKER (Firebase FCM)
//   Yeh file website ROOT mein rakho: /sw.js
// ============================================================

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey           : "AIzaSyCFIKqQ5OICMZhWPtZqmgem0bEW7QpoPcw",
  authDomain       : "appcomment.firebaseapp.com",
  projectId        : "appcomment",
  storageBucket    : "appcomment.firebasestorage.app",
  messagingSenderId: "156258808941",
  appId            : "1:156258808941:web:04a1f7470ac43657c7fb64"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage(function(payload) {
  console.log("Background message:", payload);
  const title   = payload.notification?.title || "TyagiCore 🔔";
  const options = {
    body   : payload.notification?.body || "Naya comment aaya!",
    icon   : "/favicon.ico",
    badge  : "/favicon.ico",
    tag    : "tc-notif",
    data   : { url: payload.data?.url || "/" },
    vibrate: [200, 100, 200]
  };
  return self.registration.showNotification(title, options);
});

// Notification click
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(wins) {
      for (var w of wins) {
        if (w.url.includes(url) && "focus" in w) return w.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
