class RegisterView {
	constructor() {
		this.container = document.querySelector("#main-content");
	}

	render() {
		this.container.innerHTML = `
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
		return this.container;
	}

	bindFormSubmit(handler) {
		const form = document.getElementById("register-form");
		if (form) {
			form.addEventListener("submit", handler);
		}
	}

	setupRealTimeValidation(
		nameHandler,
		emailHandler,
		passwordHandler,
		confirmPasswordHandler
	) {
		const nameInput = document.getElementById("name");
		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");
		const confirmPasswordInput = document.getElementById("confirm-password");

		if (nameInput) nameInput.addEventListener("blur", nameHandler);
		if (emailInput) emailInput.addEventListener("blur", emailHandler);
		if (passwordInput) passwordInput.addEventListener("input", passwordHandler);
		if (confirmPasswordInput)
			confirmPasswordInput.addEventListener("input", confirmPasswordHandler);
	}

	showLoading() {
		const registerBtn = document.getElementById("register-btn");
		if (registerBtn) {
			const btnText = registerBtn.querySelector(".btn-text");
			const btnLoading = registerBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "none";
				btnLoading.style.display = "inline";
				registerBtn.disabled = true;
			}
		}
	}

	hideLoading() {
		const registerBtn = document.getElementById("register-btn");
		if (registerBtn) {
			const btnText = registerBtn.querySelector(".btn-text");
			const btnLoading = registerBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "inline";
				btnLoading.style.display = "none";
				registerBtn.disabled = false;
			}
		}
	}

	showError(message, field = null) {
		if (field) {
			const errorElement = document.getElementById(`${field}-error`);
			if (errorElement) {
				errorElement.textContent = message;
			}
		} else {
			const formError = document.getElementById("form-error");
			if (formError) {
				formError.textContent = message;
			}
		}
	}

	showSuccess(message) {
		const successElement = document.getElementById("form-success");
		if (successElement) {
			successElement.textContent = message;
		}
	}

	clearMessages() {
		const errorElements = document.querySelectorAll(".error-message");
		errorElements.forEach((element) => {
			element.textContent = "";
		});

		const successElement = document.getElementById("form-success");
		if (successElement) {
			successElement.textContent = "";
		}
	}

	getFormData() {
		const form = document.getElementById("register-form");
		return form ? new FormData(form) : null;
	}

	resetForm() {
		const form = document.getElementById("register-form");
		if (form) {
			form.reset();
		}
	}
}

export default RegisterView;
