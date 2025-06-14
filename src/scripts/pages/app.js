import { getActiveRoute } from "../routes/url-parser";
import routes from "../routes/routes";
import AuthHelper from "../utils/auth-helper";
import PushNotificationHelper from "../utils/push-notification-helper";

class App {
	#content = null;
	#drawerButton = null;
	#navigationDrawer = null;
	#currentPresenter = null;

	constructor({ navigationDrawer, drawerButton, content }) {
		this.#content = content;
		this.#drawerButton = drawerButton;
		this.#navigationDrawer = navigationDrawer;

		this._setupDrawer();
		this._initialAppShell();
	}

	_setupDrawer() {
		this.#drawerButton.addEventListener("click", () => {
			this.#navigationDrawer.classList.toggle("open");
		});

		document.body.addEventListener("click", (event) => {
			if (
				!this.#navigationDrawer.contains(event.target) &&
				!this.#drawerButton.contains(event.target)
			) {
				this.#navigationDrawer.classList.remove("open");
			}

			this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
				if (link.contains(event.target)) {
					this.#navigationDrawer.classList.remove("open");
				}
			});
		});
	}

	_initialAppShell() {
		this._updateAuthNav();

		const logoutLink = document.querySelector("#logout-link");
		logoutLink.addEventListener("click", (event) => {
			event.preventDefault();
			AuthHelper.logout();
			this._updateAuthNav();
			PushNotificationHelper._updateSubscriptionUI();
			window.location.hash = "#/login";
		});
	}

	_updateAuthNav() {
		const loginLink = document.querySelector("#login-link");
		const registerLink = document.querySelector("#register-link");
		const logoutLink = document.querySelector("#logout-link");

		if (AuthHelper.isAuthenticated()) {
			loginLink.style.display = "none";
			registerLink.style.display = "none";
			logoutLink.style.display = "block";
		} else {
			loginLink.style.display = "block";
			registerLink.style.display = "block";
			logoutLink.style.display = "none";
		}
	}

	async renderPage() {
		const url = getActiveRoute();
		const route = routes[url];

		if (!route) {
			this.#content.innerHTML =
				'<div class="error-page"><h1>Page Not Found</h1></div>';
			return;
		}

		// Cleanup previous presenter
		if (
			this.#currentPresenter &&
			typeof this.#currentPresenter.destroy === "function"
		) {
			this.#currentPresenter.destroy();
		}

		// Create new presenter
		this.#currentPresenter = route.init();

		// Update auth nav and push notification UI on each page render
		this._updateAuthNav();
		PushNotificationHelper._updateSubscriptionUI();

		// Use View Transition API if supported
		if (document.startViewTransition) {
			await document.startViewTransition(async () => {
				await this.#currentPresenter.init();
			});
		} else {
			// Fallback for browsers without View Transition API
			this.#content.style.opacity = "0";

			setTimeout(async () => {
				await this.#currentPresenter.init();
				this.#content.style.opacity = "1";
			}, 150);
		}
	}
}

export default App;
