import {inject} from "aurelia-framework";
import {Navigator} from './navigator'
import { EventAggregator } from 'aurelia-event-aggregator';
import _ from 'underscore'

@inject(Navigator, EventAggregator)
export class Location {
	constructor(navigator, eventAggregator, _) {
		this.navigator = navigator;
		this.locationAutoDetectable = true;
		this.eventAggregator = eventAggregator;
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

		//TODO: Alert/remind user that location detection was disallowed

		this.update();
	}

	update() {
		// (1) tells custom attribute (searchLocation) to get busy 
		// (2) _.clone is used so object is always unique, and thus, custom attribute is always called 
		// (3) A means to pass a variable to it
		this.updateAddress =  _.clone(this.position); 

		this.publishUpdateUserPosition(this.position);

		return true; //Needed. See: https://github.com/aurelia/binding/issues/19
	}

	//*********** Pub/Sub ***********
	publishUpdateUserPosition(coordinates) {
		const UPDATE_USER_POSITION_IN_MAP = 'UPDATE_USER_POSITION_IN_MAP';

        this.eventAggregator.publish(UPDATE_USER_POSITION_IN_MAP, coordinates);
	}

}