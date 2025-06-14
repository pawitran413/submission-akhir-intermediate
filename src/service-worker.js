self.addEventListener("push", (event) => {
	console.log("Service Worker: Pushed");

	const notificationData = event.data.json();
	const { title, options } = notificationData;

	const showNotification = self.registration.showNotification(title, options);

	event.waitUntil(showNotification);
});

self.addEventListener("notificationclick", (event) => {
	console.log("Service Worker: Notification clicked");

	event.notification.close();

	const openPromise = clients.openWindow("/");
	event.waitUntil(openPromise);
});
