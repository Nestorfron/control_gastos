importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Configura Firebase con tus datos (reemplaza o usa inyección en build)
firebase.initializeApp({
    apiKey: "AIzaSyAcSENw1roaobF3r3_aTIZ0SAEpFcGLOTM",
    authDomain: "controlgastosnot.firebaseapp.com",
    projectId: "controlgastosnot",
    storageBucket: "controlgastosnot.firebasestorage.app",
    messagingSenderId: "135197957839",
    appId: "1:135197957839:web:261f6883b90143f2a2a1ba"
  });




// Obtén instancia de Messaging
const messaging = firebase.messaging();

// Maneja notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Notificación en segundo plano:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
