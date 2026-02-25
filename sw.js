/* ═══════════════════════════════════════════════════════
   TYAGI CORE — sw.js (Complete Merged Version)
   Firebase Messaging + Cache + Notification Click
   ═══════════════════════════════════════════════════════ */

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

/* ── FIREBASE INIT ── */
firebase.initializeApp({
  apiKey           : "AIzaSyCFIKqQ5OICMZhWPtZqmgem0bEW7QpoPcw",
  authDomain       : "appcomment.firebaseapp.com",
  projectId        : "appcomment",
  storageBucket    : "appcomment.firebasestorage.app",
  messagingSenderId: "156258808941",
  appId            : "1:156258808941:web:04a1f7470ac43657c7fb64"
});

const messaging = firebase.messaging();

/* ── BACKGROUND MESSAGE ── */
messaging.onBackgroundMessage(function(payload) {
  self.registration.getNotifications().then(function(notifications) {
    notifications.forEach(function(n) { n.close(); });
  });

  var title = payload.notification
    ? payload.notification.title
    : (payload.data ? payload.data.title : "TyagiCore 🔔");

  var body = payload.notification
    ? payload.notification.body
    : (payload.data ? payload.data.body : "Nayi post aa gayi!");

  var url = (payload.data && payload.data.url) ? payload.data.url : "/";
  if (url.startsWith("/")) url = "https://tyagicore.gklearnstudy.in" + url;

  return self.registration.showNotification(title, {
    body   : body,
    icon   : "/assets/images/tyagi_core.png",
    badge  : "/assets/images/tyagi_core.png",
    tag    : "tc-notif-" + Date.now(),
    data   : { url: url },
    vibrate: [200, 100, 200]
  });
});

/* ── NOTIFICATION CLICK ── */
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : "https://tyagicore.gklearnstudy.in";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(wins) {
      for (var i = 0; i < wins.length; i++) {
        if (wins[i].url === url && "focus" in wins[i]) return wins[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* ── CACHE (CSS/JS offline support) ── */
var CACHE = "tyagicore-v3";
var STATIC = ["/", "/assets/css/style.css", "/assets/js/main.js"];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(cache) { return cache.addAll(STATIC); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.hostname !== location.hostname) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var net = fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === "basic") {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() { return cached; });
      return cached || net;
    })
  );
});
