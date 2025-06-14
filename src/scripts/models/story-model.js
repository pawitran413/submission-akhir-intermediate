import DicodingStoryAPI from "../data/dicoding-story-api";
import AuthHelper from "../utils/auth-helper";
import IndexedDbHelper from "../utils/indexed-db-helper";

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
			await IndexedDbHelper.putAllStories(this.stories); // Menyimpan cerita ke IndexedDB
			return this.stories;
		} catch (error) {
			console.error("Failed to fetch from API, trying IndexedDB", error);
			this.stories = await IndexedDbHelper.getAllStories(); // Mengambil dari IndexedDB jika offline
			if (this.stories.length === 0) {
				throw new Error(
					"You are offline and no stories are cached. Please connect to the internet."
				);
			}
			return this.stories;
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
			console.error("Failed to fetch from API, trying IndexedDB", error);
			const story = await IndexedDbHelper.getStory(id);
			if (!story) {
				throw new Error(
					"You are offline and this story is not cached. Please connect to the internet."
				);
			}
			return story;
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

	async clearStories() {
		await IndexedDbHelper.clearAllStories();
		this.stories = [];
	}
}

export default StoryModel;
