import { openDB } from "idb";
import CONFIG from "../config";

const { BASE_URL } = CONFIG;
const DATABASE_NAME = `stories-database`;
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = `stories`;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
	upgrade(database) {
		database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
	},
});

const IndexedDbHelper = {
	async getAllStories() {
		const db = await dbPromise;
		return await db.getAll(OBJECT_STORE_NAME);
	},

	async getStory(id) {
		const db = await dbPromise;
		return await db.get(OBJECT_STORE_NAME, id);
	},

	async putStory(story) {
		const db = await dbPromise;
		return await db.put(OBJECT_STORE_NAME, story);
	},

	async putAllStories(stories) {
		const db = await dbPromise;
		const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
		const store = tx.objectStore(OBJECT_STORE_NAME);
		stories.forEach((story) => store.put(story));
		return tx.done;
	},

	async deleteStory(id) {
		const db = await dbPromise;
		return await db.delete(OBJECT_STORE_NAME, id);
	},

	async clearAllStories() {
		const db = await dbPromise;
		const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
		const store = tx.objectStore(OBJECT_STORE_NAME);
		store.clear();
		return tx.done;
	},
};

export default IndexedDbHelper;
