import { showFormattedDate } from "../utils/index";

class StoryDetailView {
	constructor() {
		this.container = document.querySelector("#main-content");
	}

	render() {
		this.container.innerHTML = `
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
		return this.container;
	}

	showLoading() {
		const loadingIndicator = document.getElementById("loading-indicator");
		if (loadingIndicator) {
			loadingIndicator.style.display = "block";
		}
	}

	hideLoading() {
		const loadingIndicator = document.getElementById("loading-indicator");
		if (loadingIndicator) {
			loadingIndicator.style.display = "none";
		}
	}

	showAuthRequired() {
		const storyContent = document.getElementById("story-content");
		if (storyContent) {
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
	}

	showError(message) {
		const storyContent = document.getElementById("story-content");
		if (storyContent) {
			storyContent.innerHTML = `
        <div class="error-detail" role="alert">
          <h2>Error Loading Story</h2>
          <p>${message}</p>
          <a href="#/" class="btn btn-primary">Back to Home</a>
        </div>
      `;
		}
	}

	formatDescription(description) {
		return description
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.map((line) => `<p>${line.trim()}</p>`)
			.join("");
	}

	displayStory(story) {
		const storyContent = document.getElementById("story-content");
		if (!storyContent) return;

		const locationSection =
			story.lat && story.lon
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
									story.lat
								}, ${story.lon}"></div>
          <div class="location-coordinates">
            <p><strong>Coordinates:</strong> ${story.lat.toFixed(
							6
						)}, ${story.lon.toFixed(6)}</p>
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
            <h1 class="story-title">Story by ${story.name}</h1>
            <time class="story-timestamp" datetime="${story.createdAt}">
              ${showFormattedDate(story.createdAt, "en-US", {
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
          <img src="${story.photoUrl}" 
               alt="Story photo by ${story.name}: ${story.description.substring(
			0,
			100
		)}..." 
               class="story-detail-image"
               loading="eager">
        </div>

        <div class="story-content-text">
          <h2 class="story-description-title">Story Description</h2>
          <div class="story-description" role="region" aria-label="Story content">
            ${this.formatDescription(story.description)}
          </div>
        </div>

        ${locationSection}

        <footer class="story-actions">
          <div class="action-buttons">
            <a href="#/" class="btn btn-secondary">
              ← Back to Stories
            </a>
            <button type="button" class="btn btn-primary" id="share-button">
              📤 Share Story
            </button>
          </div>
        </footer>
      </article>
    `;
	}

	bindShareButton(handler) {
		const shareButton = document.getElementById("share-button");
		if (shareButton) {
			shareButton.addEventListener("click", handler);
		}
	}

	bindMapLayerSelect(handler) {
		const layerSelect = document.getElementById("detail-map-layer-select");
		if (layerSelect) {
			layerSelect.addEventListener("change", (e) => {
				handler(e.target.value);
			});
		}
	}

	getMapContainer() {
		return document.getElementById("story-map");
	}

	showToast(message) {
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
}

export default StoryDetailView;
