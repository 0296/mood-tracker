let notificationsEnabled = false;
let lastTriggeredKey = null;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/');
    })
  );
});

// Handle toggle state from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_NOTIFICATIONS_ENABLED') {
    notificationsEnabled = event.data.enabled;
  }
});

// Best-effort local interval while the Service Worker is alive
setInterval(() => {
  if (!notificationsEnabled) return;

  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const dateStr = now.toDateString();

  const REMINDER_TIMES = [
    { h: 9, m: 0 },
    { h: 14, m: 0 },
    { h: 18, m: 0 },
    { h: 21, m: 0 }
  ];

  REMINDER_TIMES.forEach(time => {
    if (currentH === time.h && currentM === time.m) {
      const key = `${dateStr}-${currentH}:${currentM}`;
      if (lastTriggeredKey !== key) {
        lastTriggeredKey = key;
        self.registration.showNotification('Mood Tracker', {
          body: 'Time for a quick check-in! How are you feeling?',
          icon: '/joy-good.svg',
          badge: '/joy-good.svg',
          tag: 'mood-reminder',
          vibrate: [200, 100, 200]
        });
      }
    }
  });
}, 30000); 

