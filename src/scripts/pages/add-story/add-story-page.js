import DicodingStoryAPI from "../../data/dicoding-story-api";
import AuthHelper from "../../utils/auth-helper";
import MapHelper from "../../utils/map-helper";
import CameraHelper from "../../utils/camera-helper";
import L from "leaflet";

export default class AddStoryPage {
	constructor() {
		this.map = null;
		this.selectedLocation = null;
		this.capturedPhoto = null;
	}

	async render() {
		return `
      <div class="skip-link">
        <a href="#main-content" class="skip-to-content">Skip to Content</a>
      </div>
      <section class="container add-story-container" role="main">
        <header class="page-header">
          <h1>Add New Story</h1>
          <p>Share your amazing moment with the community</p>
        </header>

        <form id="add-story-form" class="add-story-form" novalidate>
          <div class="form-section">
            <h2>Story Details</h2>
            
            <div class="form-group">
              <label for="description">Story Description</label>
              <textarea id="description" name="description" required 
                        aria-describedby="description-error" 
                        placeholder="Tell us about your story..."></textarea>
              <div id="description-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-section">
            <h2>Photo Capture</h2>
            
            <div class="camera-container">
              <video id="camera-video" autoplay muted playsinline 
                     aria-label="Camera preview for photo capture"></video>
              <canvas id="photo-canvas" style="display: none;"></canvas>
              
              <div class="camera-controls">
                <button type="button" id="start-camera-btn" class="btn btn-secondary">
                  Start Camera
                </button>
                <button type="button" id="capture-photo-btn" class="btn btn-primary" 
                        style="display: none;">
                  Capture Photo
                </button>
                <button type="button" id="stop-camera-btn" class="btn btn-secondary" 
                        style="display: none;">
                  Stop Camera
                </button>
              </div>
              
              <div id="photo-preview" class="photo-preview" style="display: none;">
                <img id="captured-image" alt="Captured photo preview">
                <button type="button" id="retake-photo-btn" class="btn btn-secondary">
                  Retake Photo
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Location Selection</h2>
            <p>Click on the map to select your story location (optional)</p>
            
            <div class="map-controls">
              <label for="add-story-map-layer-select">Map Style:</label>
              <select id="add-story-map-layer-select" class="map-layer-select">
                <option value="osm" selected>OpenStreetMap</option>
                <option value="cartodb">CartoDB Light</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
            
            <div id="location-map" class="map" role="img" 
                 aria-label="Interactive map for location selection"></div>
            
            <div id="selected-location" class="location-info" style="display: none;">
              <p>Selected Location:</p>
              <span id="location-coords"></span>
              <button type="button" id="clear-location-btn" class="btn btn-link">
                Clear Location
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-btn">
              <span class="btn-text">Share Story</span>
              <span class="btn-loading" style="display: none;">Sharing...</span>
            </button>
            <a href="#/" class="btn btn-secondary">Cancel</a>
          </div>

          <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>
        </form>
      </section>
    `;
	}

	async afterRender() {
		// Check authentication
		if (!AuthHelper.isAuthenticated()) {
			window.location.hash = "#/login";
			return;
		}

		await this.initializeMap();
		this.setupCameraControls();
		this.setupForm();
		this.setupMapControls();
	}

	async initializeMap() {
		try {
			console.log("Initializing add story map with base layers...");
			this.map = await MapHelper.initializeMap("location-map");

			MapHelper.addClickHandler(this.map, (e) => {
				this.selectedLocation = {
					lat: e.latlng.lat,
					lng: e.latlng.lng,
				};

				// Clear existing markers
				this.map.eachLayer((layer) => {
					if (layer instanceof L.Marker) {
						this.map.removeLayer(layer);
					}
				});

				// Add new marker
				MapHelper.addMarker(
					this.map,
					e.latlng.lat,
					e.latlng.lng,
					"Selected Location"
				);

				// Show location info
				document.getElementById("selected-location").style.display = "block";
				document.getElementById(
					"location-coords"
				).textContent = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(
					6
				)}`;
			});

			console.log("Add story map initialized successfully");
		} catch (error) {
			console.error("Error initializing map:", error);

			const mapContainer = document.getElementById("location-map");
			if (mapContainer) {
				mapContainer.innerHTML = `
          <div class="map-error">
            <p>Unable to load map. You can still add a story without location.</p>
          </div>
        `;
			}
		}
	}

	setupMapControls() {
		const layerSelect = document.getElementById("add-story-map-layer-select");
		if (layerSelect && this.map) {
			layerSelect.addEventListener("change", (e) => {
				const selectedLayer = e.target.value;
				MapHelper.changeBaseLayer(this.map, selectedLayer);
			});
		}
	}

	setupCameraControls() {
		const video = document.getElementById("camera-video");
		const canvas = document.getElementById("photo-canvas");
		const startBtn = document.getElementById("start-camera-btn");
		const captureBtn = document.getElementById("capture-photo-btn");
		const stopBtn = document.getElementById("stop-camera-btn");
		const retakeBtn = document.getElementById("retake-photo-btn");
		const clearLocationBtn = document.getElementById("clear-location-btn");

		startBtn.addEventListener("click", async () => {
			const success = await CameraHelper.startCamera(video);
			if (success) {
				startBtn.style.display = "none";
				captureBtn.style.display = "inline-block";
				stopBtn.style.display = "inline-block";
			}
		});

		captureBtn.addEventListener("click", async () => {
			this.capturedPhoto = await CameraHelper.capturePhoto(video, canvas);

			// Show preview
			const preview = document.getElementById("photo-preview");
			const img = document.getElementById("captured-image");
			img.src = URL.createObjectURL(this.capturedPhoto);
			preview.style.display = "block";

			// Hide camera
			video.style.display = "none";
			captureBtn.style.display = "none";
			stopBtn.style.display = "none";
		});

		stopBtn.addEventListener("click", () => {
			CameraHelper.stopCamera();
			video.style.display = "block";
			startBtn.style.display = "inline-block";
			captureBtn.style.display = "none";
			stopBtn.style.display = "none";
		});

		retakeBtn.addEventListener("click", () => {
			document.getElementById("photo-preview").style.display = "none";
			video.style.display = "block";
			captureBtn.style.display = "inline-block";
			stopBtn.style.display = "inline-block";
			this.capturedPhoto = null;
		});

		clearLocationBtn.addEventListener("click", () => {
			this.selectedLocation = null;
			document.getElementById("selected-location").style.display = "none";

			// Clear markers
			if (this.map) {
				this.map.eachLayer((layer) => {
					if (layer instanceof L.Marker) {
						this.map.removeLayer(layer);
					}
				});
			}
		});
	}

	setupForm() {
		const form = document.getElementById("add-story-form");
		form.addEventListener("submit", this.handleSubmit.bind(this));
	}

	async handleSubmit(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const description = formData.get("description");

		// Clear previous errors
		this.clearErrors();

		// Validate form
		if (!this.validateForm(description)) {
			return;
		}

		const submitBtn = document.getElementById("submit-btn");
		const btnText = submitBtn.querySelector(".btn-text");
		const btnLoading = submitBtn.querySelector(".btn-loading");

		// Show loading state
		btnText.style.display = "none";
		btnLoading.style.display = "inline";
		submitBtn.disabled = true;

		try {
			const token = AuthHelper.getToken();
			const lat = this.selectedLocation ? this.selectedLocation.lat : null;
			const lon = this.selectedLocation ? this.selectedLocation.lng : null;

			const response = await DicodingStoryAPI.addStory(
				token,
				description,
				this.capturedPhoto,
				lat,
				lon
			);

			if (response.error) {
				throw new Error(response.message);
			}

			// Success - redirect to home
			alert("Story shared successfully!");
			window.location.hash = "#/";
		} catch (error) {
			document.getElementById("form-error").textContent = error.message;
		} finally {
			// Reset button state
			btnText.style.display = "inline";
			btnLoading.style.display = "none";
			submitBtn.disabled = false;
		}
	}

	validateForm(description) {
		let isValid = true;

		if (!description || description.trim().length === 0) {
			document.getElementById("description-error").textContent =
				"Description is required";
			isValid = false;
		}

		if (!this.capturedPhoto) {
			document.getElementById("form-error").textContent =
				"Please capture a photo";
			isValid = false;
		}

		return isValid;
	}

	clearErrors() {
		document.getElementById("description-error").textContent = "";
		document.getElementById("form-error").textContent = "";
	}

	// Cleanup when leaving page
	onDestroy() {
		CameraHelper.stopCamera();
		if (this.map) {
			this.map.remove();
			this.map = null;
		}
	}
}
