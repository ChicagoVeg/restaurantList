export class Google {
	constructor() {
		if (!window) {
			throw new Error('Google-maps package can be used only in a browser');
		}

		if (!window.google) {
			throw new Exception('Google maps not loaded');
		}

		if (!window.google.maps) {
			throw new Exception('Google maps api is required');
		}

		this.google = window.google; // default value
	}

	get maps() {
		return this.google.maps;
	}
}