import DicodingStoryAPI from "../../data/dicoding-story-api";
import AuthHelper from "../../utils/auth-helper";

export default class RegisterPage {
	async render() {
		return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      <section class="container auth-container" role="main">
        <div class="auth-card">
          <header class="auth-header">
            <h1>Join Dicoding Stories</h1>
            <p>Create your account and start sharing your journey</p>
          </header>

          <form id="register-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required 
                     aria-describedby="name-error" autocomplete="name"
                     placeholder="Enter your full name">
              <div id="name-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required 
                     aria-describedby="email-error" autocomplete="email"
                     placeholder="Enter your email address">
              <div id="email-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required 
                     aria-describedby="password-error" autocomplete="new-password"
                     placeholder="Minimum 8 characters">
              <div id="password-error" class="error-message" role="alert" aria-live="polite"></div>
              <small class="form-help">Password must be at least 8 characters long</small>
            </div>

            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirmPassword" required 
                     aria-describedby="confirm-password-error" autocomplete="new-password"
                     placeholder="Confirm your password">
              <div id="confirm-password-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <button type="submit" class="btn btn-primary" id="register-btn">
              <span class="btn-text">Create Account</span>
              <span class="btn-loading" style="display: none;">Creating Account...</span>
            </button>

            <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>
            <div id="form-success" class="success-message" role="alert" aria-live="polite"></div>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a href="#/login">Login here</a></p>
          </div>
        </div>
      </section>
    `;
	}

	async afterRender() {
		// Redirect if already authenticated
		if (AuthHelper.isAuthenticated()) {
			window.location.hash = "#/";
			return;
		}

		const form = document.getElementById("register-form");
		form.addEventListener("submit", this.handleRegister.bind(this));

		// Add real-time validation
		this.setupRealTimeValidation();
	}

	setupRealTimeValidation() {
		const nameInput = document.getElementById("name");
		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");
		const confirmPasswordInput = document.getElementById("confirm-password");

		nameInput.addEventListener("blur", () => this.validateName());
		emailInput.addEventListener("blur", () => this.validateEmail());
		passwordInput.addEventListener("input", () => this.validatePassword());
		confirmPasswordInput.addEventListener("input", () =>
			this.validateConfirmPassword()
		);
	}

	async handleRegister(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password");
		const confirmPassword = formData.get("confirmPassword");

		// Clear previous messages
		this.clearMessages();

		// Validate form
		if (!this.validateForm(name, email, password, confirmPassword)) {
			return;
		}

		const registerBtn = document.getElementById("register-btn");
		const btnText = registerBtn.querySelector(".btn-text");
		const btnLoading = registerBtn.querySelector(".btn-loading");

		// Show loading state
		btnText.style.display = "none";
		btnLoading.style.display = "inline";
		registerBtn.disabled = true;

		try {
			const response = await DicodingStoryAPI.register(name, email, password);

			if (response.error) {
				throw new Error(response.message);
			}

			// Show success message
			document.getElementById("form-success").textContent =
				"Account created successfully! You can now login with your credentials.";

			// Clear form
			event.target.reset();

			// Redirect to login after 2 seconds
			setTimeout(() => {
				window.location.hash = "#/login";
			}, 2000);
		} catch (error) {
			document.getElementById("form-error").textContent =
				error.message || "Registration failed. Please try again.";
		} finally {
			// Reset button state
			btnText.style.display = "inline";
			btnLoading.style.display = "none";
			registerBtn.disabled = false;
		}
	}

	validateForm(name, email, password, confirmPassword) {
		let isValid = true;

		if (!this.validateName(name)) isValid = false;
		if (!this.validateEmail(email)) isValid = false;
		if (!this.validatePassword(password)) isValid = false;
		if (!this.validateConfirmPassword(confirmPassword, password))
			isValid = false;

		return isValid;
	}

	validateName(name = null) {
		const nameValue = name || document.getElementById("name").value;
		const errorElement = document.getElementById("name-error");

		if (!nameValue || nameValue.trim().length === 0) {
			errorElement.textContent = "Full name is required";
			return false;
		}

		if (nameValue.trim().length < 2) {
			errorElement.textContent = "Name must be at least 2 characters long";
			return false;
		}

		errorElement.textContent = "";
		return true;
	}

	validateEmail(email = null) {
		const emailValue = email || document.getElementById("email").value;
		const errorElement = document.getElementById("email-error");

		if (!emailValue) {
			errorElement.textContent = "Email address is required";
			return false;
		}

		if (!this.isValidEmail(emailValue)) {
			errorElement.textContent = "Please enter a valid email address";
			return false;
		}

		errorElement.textContent = "";
		return true;
	}

	validatePassword(password = null) {
		const passwordValue = password || document.getElementById("password").value;
		const errorElement = document.getElementById("password-error");

		if (!passwordValue) {
			errorElement.textContent = "Password is required";
			return false;
		}

		if (passwordValue.length < 8) {
			errorElement.textContent = "Password must be at least 8 characters long";
			return false;
		}

		// Check password strength
		const hasUpperCase = /[A-Z]/.test(passwordValue);
		const hasLowerCase = /[a-z]/.test(passwordValue);
		const hasNumbers = /\d/.test(passwordValue);

		if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
			errorElement.textContent =
				"Password should contain uppercase, lowercase, and numbers";
			return false;
		}

		errorElement.textContent = "";
		return true;
	}

	validateConfirmPassword(confirmPassword = null, password = null) {
		const confirmPasswordValue =
			confirmPassword || document.getElementById("confirm-password").value;
		const passwordValue = password || document.getElementById("password").value;
		const errorElement = document.getElementById("confirm-password-error");

		if (!confirmPasswordValue) {
			errorElement.textContent = "Please confirm your password";
			return false;
		}

		if (confirmPasswordValue !== passwordValue) {
			errorElement.textContent = "Passwords do not match";
			return false;
		}

		errorElement.textContent = "";
		return true;
	}

	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	clearMessages() {
		document.getElementById("name-error").textContent = "";
		document.getElementById("email-error").textContent = "";
		document.getElementById("password-error").textContent = "";
		document.getElementById("confirm-password-error").textContent = "";
		document.getElementById("form-error").textContent = "";
		document.getElementById("form-success").textContent = "";
	}
}
