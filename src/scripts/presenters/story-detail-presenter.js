import MapHelper from "../utils/map-helper";
import { getStoryIdFromUrl } from "../routes/url-parser";

class StoryDetailPresenter {
	constructor({ view, model }) {
		this.view = view;
		this.model = model;
		this.story = null;
		this.map = null;
	}

	async init() {
		this.view.render();

		if (!this.model.isAuthenticated()) {
			this.view.showAuthRequired();
			return;
		}

		await this.loadStoryDetail();
	}

	async loadStoryDetail() {
		try {
			const storyId = getStoryIdFromUrl();

			if (!storyId) {
				throw new Error("Story ID not found");
			}

			this.view.showLoading();
			this.story = await this.model.getStoryDetail(storyId);
			this.view.hideLoading();
			this.view.displayStory(this.story);

			this.setupEventHandlers();

			// Initialize map if story has location
			if (this.story.lat && this.story.lon) {
				await this.initializeMap();
			}
		} catch (error) {
			this.view.hideLoading();
			this.view.showError(error.message);
		}
	}

	async initializeMap() {
		try {
			const mapContainer = this.view.getMapContainer();
			if (!mapContainer) return;

			this.map = await MapHelper.initializeMap(
				"story-map",
				this.story.lat,
				this.story.lon,
				15 // Higher zoom level for detail view
			);

			// Add marker with story info
			const popupContent = this.createPopupContent();
			MapHelper.addMarker(
				this.map,
				this.story.lat,
				this.story.lon,
				popupContent
			);
		} catch (error) {
			console.error("Error initializing map:", error);
		}
	}

	createPopupContent() {
		return `
      <div class="story-map-popup">
        <h4>${this.story.name}'s Story</h4>
        <p>${this.story.description.substring(0, 100)}...</p>
        <small>${new Date(this.story.createdAt).toLocaleDateString()}</small>
      </div>
    `;
	}

	setupEventHandlers() {
		this.view.bindShareButton(this.handleShare.bind(this));

		if (this.story.lat && this.story.lon) {
			this.view.bindMapLayerSelect(this.handleMapLayerChange.bind(this));
		}
	}

	async handleShare() {
		const shareData = {
			title: `Dicoding Story by ${this.story.name}`,
			text: this.story.description.substring(0, 100) + "...",
			url: window.location.href,
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				// Fallback: copy to clipboard
				await navigator.clipboard.writeText(window.location.href);
				this.view.showToast("Story link copied to clipboard!");
			}
		} catch (error) {
			console.error("Error sharing:", error);
			this.view.showToast("Unable to share story");
		}
	}

	handleMapLayerChange(layerType) {
		if (this.map) {
			MapHelper.changeBaseLayer(this.map, layerType);
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

export default StoryDetailPresenter;
