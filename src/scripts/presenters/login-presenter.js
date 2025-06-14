class LoginPresenter {
	constructor({ view, model }) {
		this.view = view;
		this.model = model;
	}

	async init() {
		this.view.render();
		this.setupEventHandlers();
	}

	setupEventHandlers() {
		this.view.bindFormSubmit(this.handleLogin.bind(this));
	}

	async handleLogin(event) {
		event.preventDefault();

		const formData = this.view.getFormData();
		if (!formData) return;

		const email = formData.get("email");
		const password = formData.get("password");

		// Clear previous errors
		this.view.clearErrors();

		// Validate form
		if (!this.validateForm(email, password)) {
			return;
		}

		this.view.showLoading();

		try {
			await this.model.login(email, password);

			// Redirect to home
			window.location.hash = "#/";
		} catch (error) {
			this.view.showError(error.message);
		} finally {
			this.view.hideLoading();
		}
	}

	validateForm(email, password) {
		let isValid = true;

		if (!email) {
			this.view.showError("Email is required", "email");
			isValid = false;
		} else if (!this.isValidEmail(email)) {
			this.view.showError("Please enter a valid email", "email");
			isValid = false;
		}

		if (!password) {
			this.view.showError("Password is required", "password");
			isValid = false;
		}

		return isValid;
	}

	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

export default LoginPresenter;
