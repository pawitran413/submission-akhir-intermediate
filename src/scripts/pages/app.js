import { getActiveRoute } from "../routes/url-parser";
import routes from "../routes/routes";

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
