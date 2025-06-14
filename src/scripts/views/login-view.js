class LoginView {
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
		return this.container;
	}

	bindFormSubmit(handler) {
		const form = document.getElementById("login-form");
		if (form) {
			form.addEventListener("submit", handler);
		}
	}

	showLoading() {
		const loginBtn = document.getElementById("login-btn");
		if (loginBtn) {
			const btnText = loginBtn.querySelector(".btn-text");
			const btnLoading = loginBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "none";
				btnLoading.style.display = "inline";
				loginBtn.disabled = true;
			}
		}
	}

	hideLoading() {
		const loginBtn = document.getElementById("login-btn");
		if (loginBtn) {
			const btnText = loginBtn.querySelector(".btn-text");
			const btnLoading = loginBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "inline";
				btnLoading.style.display = "none";
				loginBtn.disabled = false;
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

	clearErrors() {
		const errorElements = document.querySelectorAll(".error-message");
		errorElements.forEach((element) => {
			element.textContent = "";
		});
	}

	getFormData() {
		const form = document.getElementById("login-form");
		return form ? new FormData(form) : null;
	}
}

export default LoginView;
