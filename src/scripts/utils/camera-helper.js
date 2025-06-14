class CameraHelper {
	static stream = null;

	static async startCamera(videoElement) {
		try {
			this.stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
			});
			videoElement.srcObject = this.stream;
			return true;
		} catch (error) {
			console.error("Error accessing camera:", error);
			return false;
		}
	}

	static capturePhoto(videoElement, canvasElement) {
		const context = canvasElement.getContext("2d");
		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;
		context.drawImage(videoElement, 0, 0);

		return new Promise((resolve) => {
			canvasElement.toBlob(
				(blob) => {
					resolve(blob);
				},
				"image/jpeg",
				0.8
			);
		});
	}

	static stopCamera() {
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
			this.stream = null;
		}
	}
}

export default CameraHelper;
