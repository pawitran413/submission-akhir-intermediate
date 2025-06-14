import DicodingStoryAPI from "../data/dicoding-story-api";
import AuthHelper from "../utils/auth-helper";

class StoryModel {
	constructor() {
		this.stories = [];
	}

	async getAllStories(page = 1, size = 10, location = 1) {
		try {
			const token = AuthHelper.getToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await DicodingStoryAPI.getAllStories(
				token,
				page,
				size,
				location
			);

			if (response.error) {
				throw new Error(response.message);
			}

			this.stories = response.listStory;
			return this.stories;
		} catch (error) {
			throw error;
		}
	}

	async getStoryDetail(id) {
		try {
			const token = AuthHelper.getToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await DicodingStoryAPI.getStoryDetail(id, token);

			if (response.error) {
				throw new Error(response.message);
			}

			return response.story;
		} catch (error) {
			throw error;
		}
	}

	async addStory(description, photo, lat = null, lon = null) {
		try {
			const token = AuthHelper.getToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await DicodingStoryAPI.addStory(
				token,
				description,
				photo,
				lat,
				lon
			);

			if (response.error) {
				throw new Error(response.message);
			}

			return response;
		} catch (error) {
			throw error;
		}
	}

	isAuthenticated() {
		return AuthHelper.isAuthenticated();
	}
}

export default StoryModel;
