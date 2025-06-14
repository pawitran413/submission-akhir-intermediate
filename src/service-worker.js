// Ganti seluruh isi file src/service-worker.js dengan ini

const CACHE_NAME = "dicoding-stories-v2"; // NAMA CACHE DIUBAH
const API_BASE_URL = "https://story-api.dicoding.dev/v1/";
const ASSETS_TO_CACHE = [
	"./",
	"./index.html",
	"./app.bundle.js",
	"./app.css",
	"./favicon.png",
	"./images/logo.png",
	"./manifest.json",
	"./icons/icon-72x72.png",
	"./icons/icon-96x96.png",
	"./icons/icon-128x128.png",
	"./icons/icon-144x144.png",
	"./icons/icon-192x192.png",
	"./icons/icon-512x512.png",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
	console.log("Service Worker: Installing...");
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Service Worker: Caching app shell");
				return cache.addAll(ASSETS_TO_CACHE);
			})
			.then(() => {
				console.log("Service Worker: Install complete");
				self.skipWaiting();
			})
	);
});

self.addEventListener("activate", (event) => {
	console.log("Service Worker: Activating...");
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							console.log("Service Worker: Clearing old cache", cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	const url = new URL(event.request.url);
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		return;
	}

	if (event.request.url.startsWith(API_BASE_URL)) {
		event.respondWith(
			caches.open(CACHE_NAME).then((cache) => {
				return fetch(event.request)
					.then((response) => {
						if (response.status === 200) {
							cache.put(event.request, response.clone());
						}
						return response;
					})
					.catch(() => {
						return caches.match(event.request);
					});
			})
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((response) => {
			return (
				response ||
				fetch(event.request).then((networkResponse) => {
					return caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					});
				})
			);
		})
	);
});

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
