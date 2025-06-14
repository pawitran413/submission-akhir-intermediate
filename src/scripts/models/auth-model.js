import DicodingStoryAPI from "../data/dicoding-story-api";
import AuthHelper from "../utils/auth-helper";

class AuthModel {
	async login(email, password) {
		try {
			const response = await DicodingStoryAPI.login(email, password);

			if (response.error) {
				throw new Error(response.message);
			}

			AuthHelper.saveAuth(response.loginResult);
			return response.loginResult;
		} catch (error) {
			throw error;
		}
	}

	async register(name, email, password) {
		try {
			const response = await DicodingStoryAPI.register(name, email, password);

			if (response.error) {
				throw new Error(response.message);
			}

			return response;
		} catch (error) {
			throw error;
		}
	}

	logout() {
		AuthHelper.logout();
	}

	isAuthenticated() {
		return AuthHelper.isAuthenticated();
	}

	getUser() {
		return AuthHelper.getUser();
	}
}

export default AuthModel;
