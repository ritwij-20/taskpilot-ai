self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/icon.png', // You should have an icon.png
    badge: '/icon.png'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
