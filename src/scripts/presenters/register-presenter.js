class RegisterPresenter {
	constructor({ view, model }) {
		this.view = view;
		this.model = model;
	}

	async init() {
		this.view.render();
		this.setupEventHandlers();
	}

	setupEventHandlers() {
		this.view.bindFormSubmit(this.handleRegister.bind(this));
		this.view.setupRealTimeValidation(
			() => this.validateName(),
			() => this.validateEmail(),
			() => this.validatePassword(),
			() => this.validateConfirmPassword()
		);
	}

	async handleRegister(event) {
		event.preventDefault();

		const formData = this.view.getFormData();
		if (!formData) return;

		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password");
		const confirmPassword = formData.get("confirmPassword");

		// Clear previous messages
		this.view.clearMessages();

		// Validate form
		if (!this.validateForm(name, email, password, confirmPassword)) {
			return;
		}

		this.view.showLoading();

		try {
			await this.model.register(name, email, password);

			// Show success message
			this.view.showSuccess(
				"Account created successfully! You can now login with your credentials."
			);

			// Clear form
			this.view.resetForm();

			// Redirect to login after 2 seconds
			setTimeout(() => {
				window.location.hash = "#/login";
			}, 2000);
		} catch (error) {
			this.view.showError(
				error.message || "Registration failed. Please try again."
			);
		} finally {
			this.view.hideLoading();
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
		const nameInput = document.getElementById("name");
		const nameValue = name || (nameInput ? nameInput.value : "");

		if (!nameValue || nameValue.trim().length === 0) {
			this.view.showError("Full name is required", "name");
			return false;
		}

		if (nameValue.trim().length < 2) {
			this.view.showError("Name must be at least 2 characters long", "name");
			return false;
		}

		return true;
	}

	validateEmail(email = null) {
		const emailInput = document.getElementById("email");
		const emailValue = email || (emailInput ? emailInput.value : "");

		if (!emailValue) {
			this.view.showError("Email address is required", "email");
			return false;
		}

		if (!this.isValidEmail(emailValue)) {
			this.view.showError("Please enter a valid email address", "email");
			return false;
		}

		return true;
	}

	validatePassword(password = null) {
		const passwordInput = document.getElementById("password");
		const passwordValue =
			password || (passwordInput ? passwordInput.value : "");

		if (!passwordValue) {
			this.view.showError("Password is required", "password");
			return false;
		}

		if (passwordValue.length < 8) {
			this.view.showError(
				"Password must be at least 8 characters long",
				"password"
			);
			return false;
		}

		// Check password strength
		const hasUpperCase = /[A-Z]/.test(passwordValue);
		const hasLowerCase = /[a-z]/.test(passwordValue);
		const hasNumbers = /\d/.test(passwordValue);

		if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
			this.view.showError(
				"Password should contain uppercase, lowercase, and numbers",
				"password"
			);
			return false;
		}

		return true;
	}

	validateConfirmPassword(confirmPassword = null, password = null) {
		const confirmPasswordInput = document.getElementById("confirm-password");
		const confirmPasswordValue =
			confirmPassword ||
			(confirmPasswordInput ? confirmPasswordInput.value : "");

		const passwordInput = document.getElementById("password");
		const passwordValue =
			password || (passwordInput ? passwordInput.value : "");

		if (!confirmPasswordValue) {
			this.view.showError("Please confirm your password", "confirm-password");
			return false;
		}

		if (confirmPasswordValue !== passwordValue) {
			this.view.showError("Passwords do not match", "confirm-password");
			return false;
		}

		return true;
	}

	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

export default RegisterPresenter;
