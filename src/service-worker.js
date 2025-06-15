// Ganti seluruh isi file src/service-worker.js dengan ini

const CACHE_NAME = "dicoding-stories-v3"; // NAMA CACHE DIUBAH LAGI
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
	// Abaikan request selain GET
	if (event.request.method !== "GET") {
		return;
	}

	// Strategi untuk API: Network first, fallback ke cache
	if (event.request.url.startsWith(API_BASE_URL)) {
		event.respondWith(
			caches.open(CACHE_NAME).then(async (cache) => {
				try {
					const networkResponse = await fetch(event.request);
					if (networkResponse.ok) {
						cache.put(event.request, networkResponse.clone());
					}
					return networkResponse;
				} catch (error) {
					return cache.match(event.request);
				}
			})
		);
		return;
	}

	// Strategi untuk aset lain (termasuk navigasi halaman)
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// Jika ada di cache, langsung berikan
			if (cachedResponse) {
				return cachedResponse;
			}

			// Jika tidak ada di cache, coba ambil dari network
			return fetch(event.request).catch(() => {
				// Jika fetch gagal (offline) DAN ini adalah permintaan navigasi halaman,
				// berikan index.html sebagai fallback.
				if (event.request.mode === "navigate") {
					return caches.match("./index.html");
				}
				// Untuk request lain yang gagal (misal: gambar), biarkan saja gagal.
			});
		})
	);
});

// Listener untuk push & notificationclick tetap sama
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
	const openPromise = clients.openWindow("./"); // Arahkan ke root aplikasi
	event.waitUntil(openPromise);
});
