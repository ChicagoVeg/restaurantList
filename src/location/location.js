import {inject} from "aurelia-framework";
import {Navigator} from './navigator'
import _ from './../../jspm_packages/npm/underscore@1.8.3/underscore-min.js'

@inject(Navigator)
export class Location {
	constructor(navigator, _) {
		this.navigator = navigator;
		this.locationAutoDetectable = true;
		this.updateAddress; // used for signifying address needs updating- "auto" for current location and "manual" for user inputed
		this.position = { // default values
			latitude: '41.878114',
			longitude: '-87.629798',
			locationType: 'auto', // auto means auto-detect, manual means user inputs in an address
			addressOneLine: '',
			address: {},

			autoDectedLatitude: 0, 
			autoDetectedLongitude: 0
		};
	}

	locationAutoDetectable() {
		return this.navigator.isNavigatorSupported();
	}

	attached() {
		navigator.geolocation.getCurrentPosition( 
			this.locationDetectedAllowed.bind(this), 
			this.locationDetectedDisallowed.bind(this));
	}

	locationDetectedAllowed(position) {
		this.position.latitude = position.coords.latitude;
		this.position.longitude = position.coords.longitude;	

		this.position.autoDectedLatitude = position.coords.latitude;
		this.position.autoDetectedLongitude = position.coords.longitude;

		this.position.locationType = 'auto';

		this.update();
	}

	locationDetectedDisallowed() {
		this.position.locationType = 'manual';
		this.locationAutoDetectable = false;

		this.update();
	}

	update() {
		// (1) tells custom attribute (searchLocation) to get busy 
		// (2) _.clone is used so object is always unique, and thus, custom attribute is always called 
		// (3) A means to pass a variable to it
		this.updateAddress =  _.clone(this.position); 

		return true; //Needed. See: https://github.com/aurelia/binding/issues/19
	}
}