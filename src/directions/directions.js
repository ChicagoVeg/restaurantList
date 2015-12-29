import {inject} from "aurelia-framework";
import {EventAggregator} from 'aurelia-event-aggregator';
import {Google} from './../map/google';
import bootbox from 'bootbox';

@inject(EventAggregator, Google)
export class Directions {
	constructor(eventAggregator, Google) {
		this.position = null; // TODO: marked for deletion
		this.eventAggregator = eventAggregator;
		this.restaurant = null;
		this.map = null;
		this.google = Google;
		this.directionsDisplay = new this.google.maps.DirectionsRenderer({});
		this.travelMode= this.google.maps.DirectionsTravelMode.DRIVING; //default
		this.unitSystem = google.maps.UnitSystem.IMPERIAL;
		this.latLng = null;

		this.initializeSubscriptions();
		this.publishDirectionDisplay();
	}	

	initializeSubscriptions() {
		this.subscriptionToNewLocation();
		this.subscriptionToRestaurantSelected();
		this.subscriptionToMapInitalization();
		this.subscriptionToClearDirections();
	}
	
	setDirectionType(directionType) {
		switch(directionType) {
			case 'bicyling':
			this.travelMode= this.google.maps.DirectionsTravelMode.BICYCLING;
			break;
			case 'transit':
			this.travelMode= this.google.maps.DirectionsTravelMode.TRANSIT;
			break;
			case 'walking':
			this.travelMode= this.google.maps.DirectionsTravelMode.WALKING;
			break;
			default:
			this.travelMode= this.google.maps.DirectionsTravelMode.DRIVING;
		}

		if (!!this.restaurant) {
			this.updateDirections();	
		}

		return true;
	}

	updateDirections() {
		if (!this.latLng) {
			return;
		}

		let directionsService = new google.maps.DirectionsService(),
		directionsRequest = {
			origin: new google.maps.LatLng(this.latLng.lat, this.latLng.lng),
			destination: new google.maps.LatLng(this.restaurant.latitude, this.restaurant.longitude),
			travelMode: this.travelMode,
			unitSystem: this.unitSystem
		};

		directionsService.route(directionsRequest, (function (response, status) { // this-keyword was null when arrow function was used
			if (status === google.maps.DirectionsStatus.OK) {
				//this.publishMapDirectionNeedsUpdating();
				this.directionsDisplay.setMap(this.map); // TODO: Move this to map. Notice, this updates the map. 
				
				this.directionsDisplay.setPanel(this.directionElement); // this.directionElement is from DOM via ref
				this.directionsDisplay.setDirections(response);
				//this.publishUserMarkerShouldBeHidden();
			} else {
				bootbox.alert({
						"title": "Error with Route",
						"message": "Google Maps could not determine directions"
					});
			}

		}).bind(this));
	}

	//***********   Pub/Sub ***********
	/*
	publishMapDirectionNeedsUpdating() {
		const MAP_DIRECTION_CHANGED = 'MAP_DIRECTION_CHANGED';

        this.eventAggregator.publish(MAP_DIRECTION_CHANGED, ({
        	'setMap': this.directionsDisplay.setMap, 
        	'map': this.map
        }));
	}
	*/

	publishDirectionDisplay() {
		const DIRECTIONS_PROVIDE_DIRECTION_DISPLAY = 'DIRECTIONS_PROVIDE_DIRECTION_DISPLAY';

        this.eventAggregator.publish(DIRECTIONS_PROVIDE_DIRECTION_DISPLAY, this.directionsDisplay);
	}

/*
	publishUserMarkerShouldBeHidden() {
		const USER_MAKER_SHOULD_BE_HIDDEN = 'USER_MAKER_SHOULD_BE_HIDDEN';

        this.eventAggregator.publish(USER_MAKER_SHOULD_BE_HIDDEN);
	}
*/
	subscriptionToMapInitalization() {
		const MAP_MAP_INITIALIZED = 'MAP_MAP_INITIALIZED';
		
		this.eventAggregator.subscribe(MAP_MAP_INITIALIZED, (map => {
			this.map = map;
		}).bind(this));
	}

	subscriptionToNewLocation() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, latLng => {
			this.latLng = latLng;

			if (!!this.restaurant) { // do not get direction prior to selecting a restaurant
				this.updateDirections();
			}
		});
	}


	subscriptionToClearDirections() {
		const DIRECTIONS_CLEAR = 'DIRECTIONS_CLEAR';

		// TODO: move map change functionality to map class
		this.eventAggregator.subscribe(DIRECTIONS_CLEAR, (() => {
			this.directionsDisplay.setPanel(null);
			this.directionsDisplay.setMap(null); // move to map
			this.map.setZoom(10); 
		}).bind(this));
	}

	subscriptionToRestaurantSelected() {
		const RESTAURANTLIST_NEW_RESTAURANT_SELECTED = 'RESTAURANTLIST_NEW_RESTAURANT_SELECTED';

		this.eventAggregator.subscribe(RESTAURANTLIST_NEW_RESTAURANT_SELECTED, restaurant => {
			this.restaurant = restaurant;

			this.updateDirections();			
		});
	}

}