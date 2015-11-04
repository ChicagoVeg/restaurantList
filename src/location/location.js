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

///////
/*

                navigator.geolocation.getCurrentPosition(
                    _.bind(function (position) { // user allowed access to location
                        root.userLocation.latitude = position.coords.latitude;
                        root.userLocation.longitude = position.coords.longitude;                        
                        drawUserLocationOnMap(root, mapOptions, infoDisplay);
                        $('[value="auto"]').prop('checked', true);
                        setDistanceInMiles(root.restaurants(), root.userLocation.latitude,  root.userLocation.longitude);
                        toastr.info('Your browser supports geolocation and current location has been identified. No need to add your address');
                    }, { root: root, drawUserLocationOnMap: drawUserLocationOnMap, mapOptions: mapOptions, infoDisplay: infoDisplay }),
                    _.bind(function () { // user disallowed access to location. Bummer!
                        // some location in Chicago
                        root.userLocation.latitude = defaultCoordinates.latitude;
                        root.userLocation.longitude = defaultCoordinates.longitude;
                        drawUserLocationOnMap(root, mapOptions, infoDisplay);
                        $('[value="manual"]').prop('checked', true);
                        setDistanceInMiles(root.restaurants(), root.userLocation.latitude,  root.userLocation.longitude);
                        toastr.info('Permission to use geolocation was denied. An present location was selected automatically');
                    }, { root: root, drawUserLocationOnMap: drawUserLocationOnMap, defaultCoordinates: defaultCoordinates, mapOptions: mapOptions, infoDisplay: infoDisplay }));
*/
///////