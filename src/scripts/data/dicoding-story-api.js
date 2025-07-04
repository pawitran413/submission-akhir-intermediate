import CONFIG from "../config";

const ENDPOINTS = {
	REGISTER: `${CONFIG.BASE_URL}/register`,
	LOGIN: `${CONFIG.BASE_URL}/login`,
	STORIES: `${CONFIG.BASE_URL}/stories`,
	STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
	STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
	SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

class DicodingStoryAPI {
	static async register(name, email, password) {
		const response = await fetch(ENDPOINTS.REGISTER, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, email, password }),
		});
		return await response.json();
	}

	static async login(email, password) {
		const response = await fetch(ENDPOINTS.LOGIN, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
		return await response.json();
	}

	static async getAllStories(token, page = 1, size = 10, location = 1) {
		const url = new URL(ENDPOINTS.STORIES);
		url.searchParams.append("page", page);
		url.searchParams.append("size", size);
		url.searchParams.append("location", location);

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return await response.json();
	}

	static async getStoryDetail(id, token) {
		const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return await response.json();
	}

	static async addStory(token, description, photo, lat = null, lon = null) {
		const formData = new FormData();
		formData.append("description", description);
		formData.append("photo", photo);
		if (lat !== null) formData.append("lat", lat);
		if (lon !== null) formData.append("lon", lon);

		const response = await fetch(ENDPOINTS.STORIES, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});
		return await response.json();
	}

	static async addGuestStory(description, photo, lat = null, lon = null) {
		const formData = new FormData();
		formData.append("description", description);
		formData.append("photo", photo);
		if (lat !== null) formData.append("lat", lat);
		if (lon !== null) formData.append("lon", lon);

		const response = await fetch(ENDPOINTS.STORIES_GUEST, {
			method: "POST",
			body: formData,
		});
		return await response.json();
	}

	static async subscribePushNotification(token, subscription) {
		const subscriptionData = subscription.toJSON();

		const payload = {
			endpoint: subscriptionData.endpoint,
			keys: subscriptionData.keys,
		};

		const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to subscribe");
		}

		return response.json();
	}

	static async unsubscribePushNotification(token, endpoint) {
		const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ endpoint }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to unsubscribe");
		}

		return response.json();
	}
}

export default DicodingStoryAPI;
