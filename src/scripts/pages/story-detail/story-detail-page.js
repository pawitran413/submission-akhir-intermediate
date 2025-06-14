import DicodingStoryAPI from "../../data/dicoding-story-api";
import AuthHelper from "../../utils/auth-helper";
import MapHelper from "../../utils/map-helper";
import { showFormattedDate } from "../../utils/index";

export default class StoryDetailPage {
	constructor() {
		this.story = null;
		this.map = null;
	}

	async render() {
		return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      <section class="container story-detail-container" role="main">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="breadcrumb-list">
            <li><a href="#/">Home</a></li>
            <li aria-current="page">Story Detail</li>
          </ol>
        </nav>

        <div id="story-content" class="story-detail-content">
          <div class="loading-detail" id="loading-indicator" aria-live="polite">
            <div class="loading-spinner"></div>
            <p>Loading story details...</p>
          </div>
        </div>
      </section>
    `;
	}

	async afterRender() {
		// Check authentication
		if (!AuthHelper.isAuthenticated()) {
			this.renderAuthRequired();
			return;
		}

		await this.loadStoryDetail();
	}

	async loadStoryDetail() {
		const loadingIndicator = document.getElementById("loading-indicator");
		const storyContent = document.getElementById("story-content");

		try {
			// Get story ID from URL hash
			const storyId = this.getStoryIdFromUrl();

			if (!storyId) {
				throw new Error("Story ID not found");
			}

			const token = AuthHelper.getToken();
			const response = await DicodingStoryAPI.getStoryDetail(storyId, token);

			if (response.error) {
				throw new Error(response.message);
			}

			this.story = response.story;
			loadingIndicator.style.display = "none";
			this.renderStoryDetail();

			// Initialize map if story has location
			if (this.story.lat && this.story.lon) {
				await this.initializeMap();
			}
		} catch (error) {
			loadingIndicator.innerHTML = `
        <div class="error-detail" role="alert">
          <h2>Error Loading Story</h2>
          <p>${error.message}</p>
          <a href="#/" class="btn btn-primary">Back to Home</a>
        </div>
      `;
		}
	}

	renderStoryDetail() {
		const storyContent = document.getElementById("story-content");

		const locationSection =
			this.story.lat && this.story.lon
				? `
      <section class="story-location" aria-labelledby="location-heading">
        <h2 id="location-heading">Story Location</h2>
        <div class="map-controls">
          <label for="detail-map-layer-select">Map Style:</label>
          <select id="detail-map-layer-select" class="map-layer-select">
            <option value="osm" selected>OpenStreetMap</option>
            <option value="cartodb">CartoDB Light</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>
        <div id="story-map" class="story-detail-map" role="img" 
             aria-label="Map showing story location at coordinates ${
								this.story.lat
							}, ${this.story.lon}"></div>
        <div class="location-coordinates">
          <p><strong>Coordinates:</strong> ${this.story.lat.toFixed(
						6
					)}, ${this.story.lon.toFixed(6)}</p>
        </div>
      </section>
    `
				: `
      <section class="story-location">
        <p class="no-location">📍 No location information available for this story</p>
      </section>
    `;

		storyContent.innerHTML = `
      <article class="story-detail" role="article">
        <header class="story-header">
          <div class="story-meta">
            <h1 class="story-title">Story by ${this.story.name}</h1>
            <time class="story-timestamp" datetime="${this.story.createdAt}">
              ${showFormattedDate(this.story.createdAt, "en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
            </time>
          </div>
        </header>

        <div class="story-image-container">
          <img src="${this.story.photoUrl}" 
               alt="Story photo by ${
									this.story.name
								}: ${this.story.description.substring(0, 100)}..." 
               class="story-detail-image"
               loading="eager">
        </div>

        <div class="story-content-text">
          <h2 class="story-description-title">Story Description</h2>
          <div class="story-description" role="region" aria-label="Story content">
            ${this.formatDescription(this.story.description)}
          </div>
        </div>

        ${locationSection}

        <footer class="story-actions">
          <div class="action-buttons">
            <a href="#/" class="btn btn-secondary">
              ← Back to Stories
            </a>
            <button type="button" class="btn btn-primary" onclick="navigator.share ? navigator.share({title: 'Dicoding Story by ${
							this.story.name
						}', text: '${this.story.description.substring(
			0,
			100
		)}...', url: window.location.href}) : this.copyToClipboard()">
              📤 Share Story
            </button>
          </div>
          
          <div class="story-info">
            <p class="story-id">Story ID: <code>${this.story.id}</code></p>
          </div>
        </footer>
      </article>
    `;

		// Add share functionality
		this.setupShareButton();

		// Setup map controls if location exists
		if (this.story.lat && this.story.lon) {
			this.setupMapControls();
		}
	}

	formatDescription(description) {
		// Convert line breaks to paragraphs and handle basic formatting
		return description
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.map((line) => `<p>${line.trim()}</p>`)
			.join("");
	}

	async initializeMap() {
		try {
			console.log("Initializing story detail map with base layers...");
			this.map = await MapHelper.initializeMap(
				"story-map",
				this.story.lat,
				this.story.lon,
				15 // Higher zoom level for detail view
			);

			// Add marker with story info
			const popupContent = `
        <div class="story-map-popup">
          <h4>${this.story.name}'s Story</h4>
          <p>${this.story.description.substring(0, 100)}...</p>
          <small>${showFormattedDate(this.story.createdAt)}</small>
        </div>
      `;

			MapHelper.addMarker(
				this.map,
				this.story.lat,
				this.story.lon,
				popupContent
			);
			console.log("Story detail map initialized successfully");
		} catch (error) {
			console.error("Error initializing map:", error);
			const mapContainer = document.getElementById("story-map");
			if (mapContainer) {
				mapContainer.innerHTML = `
          <div class="map-error">
            <p>Unable to load map. Location: ${this.story.lat}, ${this.story.lon}</p>
          </div>
        `;
			}
		}
	}

	setupMapControls() {
		const layerSelect = document.getElementById("detail-map-layer-select");
		if (layerSelect && this.map) {
			layerSelect.addEventListener("change", (e) => {
				const selectedLayer = e.target.value;
				MapHelper.changeBaseLayer(this.map, selectedLayer);
			});
		}
	}

	setupShareButton() {
		const shareButton = document.querySelector(".btn-primary");
		if (shareButton) {
			shareButton.addEventListener("click", async () => {
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
						this.showToast("Story link copied to clipboard!");
					}
				} catch (error) {
					console.error("Error sharing:", error);
					this.showToast("Unable to share story");
				}
			});
		}
	}

	showToast(message) {
		// Create and show a simple toast notification
		const toast = document.createElement("div");
		toast.className = "toast";
		toast.textContent = message;
		toast.setAttribute("role", "alert");
		toast.setAttribute("aria-live", "polite");

		document.body.appendChild(toast);

		// Show toast
		setTimeout(() => toast.classList.add("show"), 100);

		// Hide and remove toast
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => document.body.removeChild(toast), 300);
		}, 3000);
	}

	renderAuthRequired() {
		const storyContent = document.getElementById("story-content");
		storyContent.innerHTML = `
      <div class="auth-required" role="alert">
        <h2>Authentication Required</h2>
        <p>Please log in to view story details.</p>
        <div class="auth-actions">
          <a href="#/login" class="btn btn-primary">Login</a>
          <a href="#/register" class="btn btn-secondary">Register</a>
        </div>
      </div>
    `;
	}

	getStoryIdFromUrl() {
		// Extract story ID from hash like #/story/story-123
		const hash = window.location.hash;
		const match = hash.match(/^#\/story\/(.+)$/);
		return match ? match[1] : null;
	}

	// Cleanup when leaving page
	onDestroy() {
		if (this.map) {
			this.map.remove();
			this.map = null;
		}
	}
}
