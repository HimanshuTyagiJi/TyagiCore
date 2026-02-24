// ============================================================
//   TYAGICORE — SERVICE WORKER (Firebase FCM)
//   File: /sw.js
// ============================================================

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Firebase Init
firebase.initializeApp({
  apiKey: "AIzaSyCFIKqQ5OICMZhWPtZqmgem0bEW7QpoPcw",
  authDomain: "appcomment.firebaseapp.com",
  projectId: "appcomment",
  storageBucket: "appcomment.firebasestorage.app",
  messagingSenderId: "156258808941",
  appId: "1:156258808941:web:04a1f7470ac43657c7fb64"
});

const messaging = firebase.messaging();

// Background Message Handler
messaging.onBackgroundMessage(function(payload) {
  console.log("[sw.js] Background Message Received:", payload);

  const title = payload.notification?.title || "TyagiCore 🔔";
  const options = {
    body: payload.notification?.body || "Naya notification aaya hai!",
    icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
    badge: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
    data: { url: payload.data?.url || "/" }, // Yahan URL pakad raha hai
    vibrate: [200, 100, 200],
    tag: "tyagicore-push-tag", // Isse notifications overlap nahi hongi
    renotify: true
  };

  return self.registration.showNotification(title, options);
});

// Click Hone Par Sahi Page Kholna
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      // Agar pehle se wahi page khula hai toh focus karo
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Warna naya window kholo
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Service Worker Install/Activate (Fast Update ke liye)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
