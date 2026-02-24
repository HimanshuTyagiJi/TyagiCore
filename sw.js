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

messaging.onBackgroundMessage(function(payload) {
  // Pehle sab existing notifications band karo — double prevent
  self.registration.getNotifications().then(function(notifications) {
    notifications.forEach(function(n) { n.close(); });
  });

  var title = payload.notification ? payload.notification.title : (payload.data ? payload.data.title : "TyagiCore 🔔");
  var body  = payload.notification ? payload.notification.body  : (payload.data ? payload.data.body  : "");
  var url   = payload.data && payload.data.url ? payload.data.url : "/";

  // Agar relative URL hai toh full URL banao
  if (url.startsWith("/")) {
    url = "https://tyagicore.gklearnstudy.in" + url;
  }

  return self.registration.showNotification(title, {
    body   : body,
    icon   : "/favicon.ico",
    tag    : "tc-notif-" + Date.now(), // Unique tag = no duplicate
    data   : { url: url },
    vibrate: [200, 100, 200]
  });
});

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  var url = e.notification.data ? e.notification.data.url : "https://tyagicore.gklearnstudy.in";
  
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(wins) {
      // Agar tab already open hai toh focus karo
      for (var i = 0; i < wins.length; i++) {
        if (wins[i].url === url && "focus" in wins[i]) {
          return wins[i].focus();
        }
      }
      // Nahi toh naya tab kholo
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
