class AuthHelper {
	static TOKEN_KEY = "dicoding_story_token";
	static USER_KEY = "dicoding_story_user";

	static saveAuth(loginResult) {
		localStorage.setItem(this.TOKEN_KEY, loginResult.token);
		localStorage.setItem(
			this.USER_KEY,
			JSON.stringify({
				userId: loginResult.userId,
				name: loginResult.name,
			})
		);
	}

	static getToken() {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	static getUser() {
		const user = localStorage.getItem(this.USER_KEY);
		return user ? JSON.parse(user) : null;
	}

	static isAuthenticated() {
		return !!this.getToken();
	}

	static logout() {
		localStorage.removeItem(this.TOKEN_KEY);
		localStorage.removeItem(this.USER_KEY);
	}
}

export default AuthHelper;
