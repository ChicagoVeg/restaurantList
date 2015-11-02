export class Navigator {
	constructor() {
		if (!window) {
			throw new Error('window.navigator can be used only in a browser');
		}
		
		this.navigator = window.navigator; 
	}

	get geolocation() {
		return this.navigator.geolocation;
	}

	isNavigatorSupported() {
		return !!this.navigator;
	}
}