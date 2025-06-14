import MapHelper from "../utils/map-helper";
import CameraHelper from "../utils/camera-helper";
import L from "leaflet";

class AddStoryPresenter {
	constructor({ view, model }) {
		this.view = view;
		this.model = model;
		this.map = null;
		this.selectedLocation = null;
		this.capturedPhoto = null;
	}

	async init() {
		this.view.render();

		if (!this.model.isAuthenticated()) {
			window.location.hash = "#/login";
			return;
		}

		await this.initializeMap();
		this.setupEventHandlers();
	}

	async initializeMap() {
		try {
			const mapContainer = this.view.getMapContainer();
			if (!mapContainer) return;

			this.map = await MapHelper.initializeMap("location-map");

			MapHelper.addClickHandler(this.map, this.handleMapClick.bind(this));
		} catch (error) {
			console.error("Error initializing map:", error);
		}
	}

	setupEventHandlers() {
		this.view.bindStartCamera(this.handleStartCamera.bind(this));
		this.view.bindCapturePhoto(this.handleCapturePhoto.bind(this));
		this.view.bindStopCamera(this.handleStopCamera.bind(this));
		this.view.bindRetakePhoto(this.handleRetakePhoto.bind(this));
		this.view.bindClearLocation(this.handleClearLocation.bind(this));
		this.view.bindFormSubmit(this.handleSubmit.bind(this));
		this.view.bindMapLayerSelect(this.handleMapLayerChange.bind(this));
	}

	async handleStartCamera() {
		const videoElement = this.view.getVideoElement();
		if (!videoElement) return;

		const success = await CameraHelper.startCamera(videoElement);
		if (success) {
			this.view.showCameraControls(true);
		}
	}

	async handleCapturePhoto() {
		const videoElement = this.view.getVideoElement();
		const canvasElement = this.view.getCanvasElement();
		if (!videoElement || !canvasElement) return;

		this.capturedPhoto = await CameraHelper.capturePhoto(
			videoElement,
			canvasElement
		);
		this.view.showPhotoPreview(this.capturedPhoto);
	}

	handleStopCamera() {
		CameraHelper.stopCamera();
		const videoElement = this.view.getVideoElement();
		if (videoElement) {
			videoElement.style.display = "block";
		}
		this.view.showCameraControls(false);
	}

	handleRetakePhoto() {
		this.capturedPhoto = null;
		this.view.hidePhotoPreview();
	}

	handleMapClick(e) {
		this.selectedLocation = {
			lat: e.latlng.lat,
			lng: e.latlng.lng,
		};

		// Clear existing markers
		if (this.map) {
			this.map.eachLayer((layer) => {
				if (layer instanceof L.Marker) {
					this.map.removeLayer(layer);
				}
			});
		}

		// Add new marker
		MapHelper.addMarker(
			this.map,
			e.latlng.lat,
			e.latlng.lng,
			"Selected Location"
		);

		// Show location info
		this.view.showSelectedLocation(e.latlng.lat, e.latlng.lng);
	}

	handleClearLocation() {
		this.selectedLocation = null;
		this.view.hideSelectedLocation();

		// Clear markers
		if (this.map) {
			this.map.eachLayer((layer) => {
				if (layer instanceof L.Marker) {
					this.map.removeLayer(layer);
				}
			});
		}
	}

	handleMapLayerChange(layerType) {
		if (this.map) {
			MapHelper.changeBaseLayer(this.map, layerType);
		}
	}

	async handleSubmit(event) {
		event.preventDefault();

		const formData = this.view.getFormData();
		if (!formData) return;

		const description = formData.get("description");

		// Clear previous errors
		this.view.clearErrors();

		// Validate form
		if (!this.validateForm(description)) {
			return;
		}

		this.view.showLoading();

		try {
			const lat = this.selectedLocation ? this.selectedLocation.lat : null;
			const lon = this.selectedLocation ? this.selectedLocation.lng : null;

			await this.model.addStory(description, this.capturedPhoto, lat, lon);

			// Success - redirect to home
			alert("Story shared successfully!");
			window.location.hash = "#/";
		} catch (error) {
			this.view.showError(error.message);
		} finally {
			this.view.hideLoading();
		}
	}

	validateForm(description) {
		let isValid = true;

		if (!description || description.trim().length === 0) {
			this.view.showError("Description is required", "description");
			isValid = false;
		}

		if (!this.capturedPhoto) {
			this.view.showError("Please capture a photo");
			isValid = false;
		}

		return isValid;
	}

	// Cleanup when leaving page
	destroy() {
		CameraHelper.stopCamera();
		if (this.map) {
			this.map.remove();
			this.map = null;
		}
	}
}

export default AddStoryPresenter;
