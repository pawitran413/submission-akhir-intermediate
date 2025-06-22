import MapHelper from "../utils/map-helper";

class HomePresenter {
	constructor({ view, model }) {
		this.view = view;
		this.model = model;
		this.map = null;
	}

	async init() {
		this.view.render();
		await this.loadStories();
		await this.initializeMap();
		this.setupEventHandlers();
	}

	async loadStories() {
		try {
			if (!this.model.isAuthenticated()) {
				this.view.showAuthPrompt();
				return;
			}

			this.view.showLoading();
			const stories = await this.model.getAllStories();
			this.view.hideLoading();
			this.view.displayStories(stories);
			this.view.bindSaveStoryButtons(stories, this.handleSaveStory.bind(this));
		} catch (error) {
			this.view.hideLoading();
			this.view.showError(error.message);
		}
	}

	async initializeMap() {
		try {
			const mapContainer = this.view.getMapContainer();
			if (!mapContainer) return;

			this.map = await MapHelper.initializeMap("stories-map");

			const stories = this.model.stories;
			stories.forEach((story) => {
				if (story.lat && story.lon) {
					const popupContent = this.createPopupContent(story);
					MapHelper.addMarker(this.map, story.lat, story.lon, popupContent);
				}
			});
		} catch (error) {
			console.error("Error initializing map:", error);
		}
	}

	createPopupContent(story) {
		return `
      <div class="map-popup">
        <h4>${story.name}</h4>
        <p>${story.description.substring(0, 100)}...</p>
        <small>${new Date(story.createdAt).toLocaleDateString()}</small>
      </div>
    `;
	}

	setupEventHandlers() {
		this.view.bindMapLayerSelect(this.handleMapLayerChange.bind(this));
		this.view.bindClearStories(this.handleClearStories.bind(this));
	}

	async handleClearStories() {
		const confirmation = confirm(
			"Are you sure you want to delete all cached stories? This action cannot be undone."
		);
		if (confirmation) {
			try {
				await this.model.clearStories();
				alert("Cached stories have been cleared successfully.");
				// Re-render to show empty state
				this.view.displayStories([]);
				// Clear markers on the map
				if (this.map) {
					this.map.eachLayer((layer) => {
						if (layer instanceof L.Marker) {
							this.map.removeLayer(layer);
						}
					});
				}
			} catch (error) {
				alert("Failed to clear cached stories. Please try again.");
				console.error("Error clearing stories:", error);
			}
		}
	}

	handleMapLayerChange(layerType) {
		if (this.map) {
			MapHelper.changeBaseLayer(this.map, layerType);
		}
	}

	async handleSaveStory(storyId) {
		try {
			const story = this.model.stories.find((s) => s.id === storyId);
			if (!story) {
				alert("Story not found.");
				return;
			}
			await this.model.saveStoryToIndexedDB(story);
			alert("Story berhasil disimpan ke perangkat!");
		} catch (error) {
			alert("Gagal menyimpan story. Silakan coba lagi.");
			console.error(error);
		}
	}

	// Cleanup when leaving page
	destroy() {
		if (this.map) {
			this.map.remove();
			this.map = null;
		}
	}
}

export default HomePresenter;
