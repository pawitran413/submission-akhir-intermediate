import L from "leaflet";

class MapHelper {
	static async initializeMap(
		containerId,
		lat = -6.2088,
		lng = 106.8456,
		zoom = 10
	) {
		// Define base layers first
		const osmLayer = L.tileLayer(
			"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			{
				attribution: "© OpenStreetMap contributors",
				maxZoom: 19,
			}
		);

		const cartoDBLayer = L.tileLayer(
			"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
			{
				attribution: "© OpenStreetMap contributors © CARTO",
				maxZoom: 19,
			}
		);

		const satelliteLayer = L.tileLayer(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
			{
				attribution: "© Esri © OpenStreetMap contributors",
				maxZoom: 19,
			}
		);

		// Create map with default base layer
		const map = L.map(containerId, {
			center: [lat, lng],
			zoom: zoom,
			layers: [osmLayer], // Set OpenStreetMap as default base layer
		});

		// Define base layers for layer control
		const baseLayers = {
			OpenStreetMap: osmLayer,
			"CartoDB Light": cartoDBLayer,
			Satellite: satelliteLayer,
		};

		// Add layer control to map
		L.control.layers(baseLayers).addTo(map);

		return map;
	}

	static addMarker(map, lat, lng, popupContent = "") {
		const marker = L.marker([lat, lng]).addTo(map);
		if (popupContent) {
			marker.bindPopup(popupContent);
		}
		return marker;
	}

	static addClickHandler(map, callback) {
		map.on("click", callback);
	}

	// Helper method to get available base layers
	static getBaseLayers() {
		return {
			osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution: "© OpenStreetMap contributors",
				maxZoom: 19,
			}),
			cartodb: L.tileLayer(
				"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
				{
					attribution: "© OpenStreetMap contributors © CARTO",
					maxZoom: 19,
				}
			),
			satellite: L.tileLayer(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
				{
					attribution: "© Esri © OpenStreetMap contributors",
					maxZoom: 19,
				}
			),
		};
	}

	// Method to change base layer programmatically
	static changeBaseLayer(map, layerType) {
		const baseLayers = this.getBaseLayers();

		// Remove all existing tile layers
		map.eachLayer((layer) => {
			if (layer instanceof L.TileLayer) {
				map.removeLayer(layer);
			}
		});

		// Add new base layer
		if (baseLayers[layerType]) {
			baseLayers[layerType].addTo(map);
		} else {
			// Fallback to OSM if layer type not found
			baseLayers.osm.addTo(map);
		}
	}
}

export default MapHelper;
