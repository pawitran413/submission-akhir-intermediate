import { showFormattedDate } from "../utils/index";

class HomeView {
	constructor() {
		this.container = document.querySelector("#main-content");
	}

	render() {
		this.container.innerHTML = `
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

	showAuthPrompt() {
		const storiesContainer = document.getElementById("stories-list");
		if (storiesContainer) {
			storiesContainer.innerHTML = `
        <div class="auth-prompt">
          <p>Please <a href="#/login">login</a> to view stories</p>
        </div>
      `;
		}
	}

	showError(message) {
		const storiesContainer = document.getElementById("stories-list");
		if (storiesContainer) {
			storiesContainer.innerHTML = `
        <div class="error-message" role="alert">
          Error loading stories: ${message}
        </div>
      `;
		}
	}

	displayStories(stories) {
		const storiesContainer = document.getElementById("stories-list");

		if (!storiesContainer) return;

		if (stories.length === 0) {
			storiesContainer.innerHTML = "<p>No stories available</p>";
			return;
		}

		const storiesHTML = stories
			.map(
				(story) => `
        <article class="story-card" role="article">
          <div class="story-image">
            <img src="${story.photoUrl}" 
                 alt="Story photo by ${
										story.name
									}: ${story.description.substring(0, 100)}..." 
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

	bindMapLayerSelect(handler) {
		const layerSelect = document.getElementById("map-layer-select");
		if (layerSelect) {
			layerSelect.addEventListener("change", (e) => {
				handler(e.target.value);
			});
		}
	}

	getMapContainer() {
		return document.getElementById("stories-map");
	}
}

export default HomeView;
