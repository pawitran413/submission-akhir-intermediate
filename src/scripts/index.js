// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import PushNotificationHelper from "./utils/push-notification-helper";

document.addEventListener("DOMContentLoaded", async () => {
	const app = new App({
		content: document.querySelector("#main-content"),
		drawerButton: document.querySelector("#drawer-button"),
		navigationDrawer: document.querySelector("#navigation-drawer"),
	});
	await app.renderPage();

	window.addEventListener("hashchange", async () => {
		await app.renderPage();
	});

	// Initialize Push Notification Helper
	await PushNotificationHelper.init();
});
