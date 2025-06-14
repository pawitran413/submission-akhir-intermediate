import DicodingStoryAPI from "../../data/dicoding-story-api";
import AuthHelper from "../../utils/auth-helper";

export default class LoginPage {
	async render() {
		return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      <section class="container auth-container" role="main">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Login to Dicoding Stories</h1>
            <p>Share your amazing journey with the community</p>
          </header>

          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required 
                     aria-describedby="email-error" autocomplete="email">
              <div id="email-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required 
                     aria-describedby="password-error" autocomplete="current-password">
              <div id="password-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <button type="submit" class="btn btn-primary" id="login-btn">
              <span class="btn-text">Login</span>
              <span class="btn-loading" style="display: none;">Logging in...</span>
            </button>

            <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a href="#/register">Register here</a></p>
          </div>
        </div>
      </section>
    `;
	}

	async afterRender() {
		const form = document.getElementById("login-form");
		form.addEventListener("submit", this.handleLogin.bind(this));
	}

	async handleLogin(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const email = formData.get("email");
		const password = formData.get("password");

		// Clear previous errors
		this.clearErrors();

		// Validate form
		if (!this.validateForm(email, password)) {
			return;
		}

		const loginBtn = document.getElementById("login-btn");
		const btnText = loginBtn.querySelector(".btn-text");
		const btnLoading = loginBtn.querySelector(".btn-loading");

		// Show loading state
		btnText.style.display = "none";
		btnLoading.style.display = "inline";
		loginBtn.disabled = true;

		try {
			const response = await DicodingStoryAPI.login(email, password);

			if (response.error) {
				throw new Error(response.message);
			}

			AuthHelper.saveAuth(response.loginResult);

			// Redirect to home
			window.location.hash = "#/";
		} catch (error) {
			document.getElementById("form-error").textContent = error.message;
		} finally {
			// Reset button state
			btnText.style.display = "inline";
			btnLoading.style.display = "none";
			loginBtn.disabled = false;
		}
	}

	validateForm(email, password) {
		let isValid = true;

		if (!email) {
			document.getElementById("email-error").textContent = "Email is required";
			isValid = false;
		} else if (!this.isValidEmail(email)) {
			document.getElementById("email-error").textContent =
				"Please enter a valid email";
			isValid = false;
		}

		if (!password) {
			document.getElementById("password-error").textContent =
				"Password is required";
			isValid = false;
		}

		return isValid;
	}

	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	clearErrors() {
		document.getElementById("email-error").textContent = "";
		document.getElementById("password-error").textContent = "";
		document.getElementById("form-error").textContent = "";
	}
}
