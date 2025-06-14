class AddStoryView {
	constructor() {
		this.container = document.querySelector("#main-content");
	}

	render() {
		this.container.innerHTML = `
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
		return this.container;
	}

	bindStartCamera(handler) {
		const startBtn = document.getElementById("start-camera-btn");
		if (startBtn) {
			startBtn.addEventListener("click", handler);
		}
	}

	bindCapturePhoto(handler) {
		const captureBtn = document.getElementById("capture-photo-btn");
		if (captureBtn) {
			captureBtn.addEventListener("click", handler);
		}
	}

	bindStopCamera(handler) {
		const stopBtn = document.getElementById("stop-camera-btn");
		if (stopBtn) {
			stopBtn.addEventListener("click", handler);
		}
	}

	bindRetakePhoto(handler) {
		const retakeBtn = document.getElementById("retake-photo-btn");
		if (retakeBtn) {
			retakeBtn.addEventListener("click", handler);
		}
	}

	bindClearLocation(handler) {
		const clearLocationBtn = document.getElementById("clear-location-btn");
		if (clearLocationBtn) {
			clearLocationBtn.addEventListener("click", handler);
		}
	}

	bindFormSubmit(handler) {
		const form = document.getElementById("add-story-form");
		if (form) {
			form.addEventListener("submit", handler);
		}
	}

	bindMapLayerSelect(handler) {
		const layerSelect = document.getElementById("add-story-map-layer-select");
		if (layerSelect) {
			layerSelect.addEventListener("change", (e) => {
				handler(e.target.value);
			});
		}
	}

	getVideoElement() {
		return document.getElementById("camera-video");
	}

	getCanvasElement() {
		return document.getElementById("photo-canvas");
	}

	getMapContainer() {
		return document.getElementById("location-map");
	}

	showCameraControls(show) {
		const startBtn = document.getElementById("start-camera-btn");
		const captureBtn = document.getElementById("capture-photo-btn");
		const stopBtn = document.getElementById("stop-camera-btn");

		if (startBtn) startBtn.style.display = show ? "none" : "inline-block";
		if (captureBtn) captureBtn.style.display = show ? "inline-block" : "none";
		if (stopBtn) stopBtn.style.display = show ? "inline-block" : "none";
	}

	showPhotoPreview(photoBlob) {
		const preview = document.getElementById("photo-preview");
		const img = document.getElementById("captured-image");
		const video = document.getElementById("camera-video");

		if (preview && img && video) {
			img.src = URL.createObjectURL(photoBlob);
			preview.style.display = "block";
			video.style.display = "none";
			this.showCameraControls(false);
		}
	}

	hidePhotoPreview() {
		const preview = document.getElementById("photo-preview");
		const video = document.getElementById("camera-video");

		if (preview && video) {
			preview.style.display = "none";
			video.style.display = "block";
			this.showCameraControls(true);
		}
	}

	showSelectedLocation(lat, lng) {
		const locationInfo = document.getElementById("selected-location");
		const locationCoords = document.getElementById("location-coords");

		if (locationInfo && locationCoords) {
			locationInfo.style.display = "block";
			locationCoords.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
		}
	}

	hideSelectedLocation() {
		const locationInfo = document.getElementById("selected-location");
		if (locationInfo) {
			locationInfo.style.display = "none";
		}
	}

	showLoading() {
		const submitBtn = document.getElementById("submit-btn");
		if (submitBtn) {
			const btnText = submitBtn.querySelector(".btn-text");
			const btnLoading = submitBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "none";
				btnLoading.style.display = "inline";
				submitBtn.disabled = true;
			}
		}
	}

	hideLoading() {
		const submitBtn = document.getElementById("submit-btn");
		if (submitBtn) {
			const btnText = submitBtn.querySelector(".btn-text");
			const btnLoading = submitBtn.querySelector(".btn-loading");

			if (btnText && btnLoading) {
				btnText.style.display = "inline";
				btnLoading.style.display = "none";
				submitBtn.disabled = false;
			}
		}
	}

	showError(message, field = null) {
		if (field) {
			const errorElement = document.getElementById(`${field}-error`);
			if (errorElement) {
				errorElement.textContent = message;
			}
		} else {
			const formError = document.getElementById("form-error");
			if (formError) {
				formError.textContent = message;
			}
		}
	}

	clearErrors() {
		const errorElements = document.querySelectorAll(".error-message");
		errorElements.forEach((element) => {
			element.textContent = "";
		});
	}

	getFormData() {
		const form = document.getElementById("add-story-form");
		return form ? new FormData(form) : null;
	}
}

export default AddStoryView;
