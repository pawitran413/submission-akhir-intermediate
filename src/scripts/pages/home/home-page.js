import DicodingStoryAPI from "../../data/dicoding-story-api";
import AuthHelper from "../../utils/auth-helper";
import MapHelper from "../../utils/map-helper";
import { showFormattedDate } from "../../utils/index";

export default class HomePage {
	constructor() {
		this.stories = [];
		this.map = null;
	}

	async render() {
		return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      <section class="container" role="main">
        <header class="page-header">
          <h1>Dicoding Stories</h1>
        </header>

        <div class="stories-container">
          <div class="stories-list" id="stories-list" role="region" aria-label="Stories list">
            <div class="loading" id="loading-indicator" aria-live="polite">
              Loading stories...
            </div>
          </div>
          
          <div class="map-container">
            <h2>Story Locations</h2>
            <div class="map-controls">
              <label for="map-layer-select">Map Style:</label>
              <select id="map-layer-select" class="map-layer-select">
                <option value="osm" selected>OpenStreetMap</option>
                <option value="cartodb">CartoDB Light</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
            <div id="stories-map" class="map" role="img" aria-label="Map showing story locations"></div>
          </div>
        </div>
      </section>
    `;
	}

	async afterRender() {
		await this.loadStories();
		await this.initializeMap();
		this.setupMapControls();
	}

	async loadStories() {
		const loadingIndicator = document.getElementById("loading-indicator");
		const storiesContainer = document.getElementById("stories-list");

		try {
			const token = AuthHelper.getToken();
			if (!token) {
				storiesContainer.innerHTML = `
          <div class="auth-prompt">
            <p>Please <a href="#/login">login</a> to view stories</p>
          </div>
        `;
				return;
			}

			const response = await DicodingStoryAPI.getAllStories(token, 1, 20, 1);

			if (response.error) {
				throw new Error(response.message);
			}

			this.stories = response.listStory;
			loadingIndicator.style.display = "none";
			this.renderStories();
		} catch (error) {
			loadingIndicator.innerHTML = `
        <div class="error-message" role="alert">
          Error loading stories: ${error.message}
        </div>
      `;
		}
	}

	renderStories() {
		const storiesContainer = document.getElementById("stories-list");

		if (this.stories.length === 0) {
			storiesContainer.innerHTML = "<p>No stories available</p>";
			return;
		}

		const storiesHTML = this.stories
			.map(
				(story) => `
      <article class="story-card" role="article">
        <div class="story-image">
          <img src="${story.photoUrl}" 
               alt="Story photo by ${story.name}: ${story.description.substring(
					0,
					100
				)}..." 
               loading="lazy">
        </div>
        <div class="story-content">
          <h3 class="story-author">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <time class="story-date" datetime="${story.createdAt}">
            ${showFormattedDate(story.createdAt)}
          </time>
          <a href="#/story/${
						story.id
					}" class="story-link" aria-label="Read full story by ${story.name}">
            Read More
          </a>
        </div>
      </article>
    `
			)
			.join("");

		storiesContainer.innerHTML = storiesHTML;
	}

	async initializeMap() {
		try {
			console.log("Initializing map with base layers...");
			this.map = await MapHelper.initializeMap("stories-map");

			this.stories.forEach((story) => {
				if (story.lat && story.lon) {
					const popupContent = `
            <div class="map-popup">
              <h4>${story.name}</h4>
              <p>${story.description.substring(0, 100)}...</p>
              <small>${showFormattedDate(story.createdAt)}</small>
            </div>
          `;
					MapHelper.addMarker(this.map, story.lat, story.lon, popupContent);
				}
			});

			console.log("Map initialized successfully with base layers");
		} catch (error) {
			console.error("Error initializing map:", error);

			// Show error message in map container
			const mapContainer = document.getElementById("stories-map");
			if (mapContainer) {
				mapContainer.innerHTML = `
          <div class="map-error">
            <p>Unable to load map. Please check your connection.</p>
          </div>
        `;
			}
		}
	}

	setupMapControls() {
		const layerSelect = document.getElementById("map-layer-select");
		if (layerSelect && this.map) {
			layerSelect.addEventListener("change", (e) => {
				const selectedLayer = e.target.value;
				MapHelper.changeBaseLayer(this.map, selectedLayer);
			});
		}
	}
}
