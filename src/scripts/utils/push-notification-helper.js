import DicodingStoryAPI from "../data/dicoding-story-api";
import AuthHelper from "./auth-helper";
import CONFIG from "../config";

const PushNotificationHelper = {
	async init() {
		if (!this._checkAvailability()) {
			console.log("Push messaging isn't supported in this browser");
			return;
		}

		await this._registerServiceWorker();
		this.subscribeButton = document.querySelector("#subscribe-push-notification");
		this.unsubscribeButton = document.querySelector(
			"#unsubscribe-push-notification"
		);

		await this._updateSubscriptionUI();
		this._setupEventListeners();
	},

	_checkAvailability() {
		return "serviceWorker" in navigator && "PushManager" in window;
	},

	async _registerServiceWorker() {
		try {
			await navigator.serviceWorker.register("./service-worker.js");
			console.log("Service worker registered successfully");
		} catch (error) {
			console.error("Failed to register service worker", error);
		}
	},

	_setupEventListeners() {
		this.subscribeButton.addEventListener("click", async () => {
			await this._subscribePush();
		});

		this.unsubscribeButton.addEventListener("click", async () => {
			await this._unsubscribePush();
		});
	},

	async _subscribePush() {
		try {
			const permission = await this._requestPermission();
			if (permission !== "granted") {
				console.log("Notification permission not granted");
				return;
			}

			// ===== PERBAIKAN DIMULAI DI SINI =====
			let pushSubscription = await this._getPushSubscription();

			// Jika tidak ada subscription, buat yang baru
			if (!pushSubscription) {
				console.log("Creating new push subscription...");
				pushSubscription = await this._createPushSubscription();
				if (!pushSubscription) {
					console.error("Failed to create new push subscription.");
					return;
				}
			}
			// ===== AKHIR DARI PERBAIKAN =====

			const token = AuthHelper.getToken();
			await DicodingStoryAPI.subscribePushNotification(
				token,
				pushSubscription
			);
			await this._updateSubscriptionUI();
			console.log("Successfully subscribed to push notification");
		} catch (error) {
			console.error("Failed to subscribe to push notification", error);
		}
	},

	async _unsubscribePush() {
		try {
			const pushSubscription = await this._getPushSubscription();
			if (!pushSubscription) return;

			const token = AuthHelper.getToken();
			await DicodingStoryAPI.unsubscribePushNotification(
				token,
				pushSubscription.endpoint
			);
			await pushSubscription.unsubscribe();
			await this._updateSubscriptionUI();
			console.log("Successfully unsubscribed from push notification");
		} catch (error) {
			console.error("Failed to unsubscribe from push notification", error);
		}
	},

	async _getPushSubscription() {
		const registration = await navigator.serviceWorker.ready;
		return await registration.pushManager.getSubscription();
	},



	async _requestPermission() {
		return await Notification.requestPermission();
	},

	async _updateSubscriptionUI() {
		const pushSubscription = await this._getPushSubscription();
		const isAuthenticated = AuthHelper.isAuthenticated();

		if (!isAuthenticated) {
			this.subscribeButton.style.display = "none";
			this.unsubscribeButton.style.display = "none";
			return;
		}

		if (pushSubscription) {
			this.subscribeButton.style.display = "none";
			this.unsubscribeButton.style.display = "inline-block";
		} else {
			this.subscribeButton.style.display = "inline-block";
			this.unsubscribeButton.style.display = "none";
		}
	},

	urlBase64ToUint8Array(base64String) {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; i += 1) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	},

	async _createPushSubscription() {
		const registration = await navigator.serviceWorker.ready;
		const vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
		const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

		try {
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});
			return subscription;
		} catch (error) {
			console.error("Error creating subscription:", error);
			// Jika pengguna menolak izin, browser akan melempar error.
			if (Notification.permission === 'denied') {
				alert("You have denied notification permissions. Please enable them in your browser settings to subscribe.");
			}
			return null;
		}
	},
};

export default PushNotificationHelper;