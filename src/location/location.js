import {inject} from "aurelia-framework";
import {Navigator} from './navigator'
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(Navigator, EventAggregator)
export class Location {
	constructor(navigator, eventAggregator) {
		this.navigator = navigator;
		this.eventAggregator = eventAggregator;
		this.position = { // default values
			latitude: '41.878114',
			longitude: '-87.629798'
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

		this.publish();
	}

	locationDetectedDisallowed() {
		this.publish();
	}

	publish() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.publish(LOCATION_UPDATED_EVENT , this.position);		
	}

	updateAddress() {
	}
}

///////
/*
import {EventAggregator} from 'aurelia-event-aggregator';

export class APublisher{
    static inject = [EventAggregator];
    constructor(eventAggregator){
        this.eventAggregator = eventAggregator;
    }

    publish(){
        var payload = {}; //any object
        this.eventAggregator.publish('channel name here', payload);
    }
}
  publish(){
        var payload = {}; //any object
        this.eventAggregator.publish('channel name here', payload);
    }


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