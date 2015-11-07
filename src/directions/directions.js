import {inject} from "aurelia-framework";
import {EventAggregator} from 'aurelia-event-aggregator';
import {Google} from './../map/google'

@inject(EventAggregator, Google)
export class Directions {
	constructor(eventAggregator, Google) {
		this.position = null;
		this.eventAggregator = eventAggregator;
		this.restaurant = null;
		this.map = null;
		this.google = Google;
		this.directionsDisplay = new this.google.maps.DirectionsRenderer({});
		this.travelMode= this.google.maps.DirectionsTravelMode.DRIVING; //default
		this.unitSystem = google.maps.UnitSystem.IMPERIAL;

		this.initializeSubscriptions();
	}	

	initializeSubscriptions() {
		this.locationUpdatedSubscription();
		this.restaurantSelectedSubscription();
		this.subscribeToMapInitalization();
	}

	locationUpdatedSubscription() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, position => {
			this.position = position;

			if (!!this.restaurant) { // do not get direction prior to selecting a restaurant
				this.updateDirections();
			}
		});
	}

	subscribeToMapInitalization() {
		const MAP_MAP_INITIALIZED = 'MAP_MAP_INITIALIZED';
		
		this.eventAggregator.subscribe(MAP_MAP_INITIALIZED, map => {
			this.map = map;
		});
	}

	restaurantSelectedSubscription() {
		const RESTAURANTLIST_NEW_RESTAURANT_SELECTED = 'RESTAURANTLIST_NEW_RESTAURANT_SELECTED';

		this.eventAggregator.subscribe(RESTAURANTLIST_NEW_RESTAURANT_SELECTED, restaurant => {
			this.restaurant = restaurant;

			this.updateDirections();			
		});
	}

	updateDirections() {
		if (!this.position) {
			return;
		}

		let directionsService = new google.maps.DirectionsService(),
		directionsRequest = {
			origin: new google.maps.LatLng(this.position.latitude, this.position.longitude),
			destination: new google.maps.LatLng(this.restaurant.latitude, this.restaurant.longitude),
			travelMode: this.travelMode,
			unitSystem: this.unitSystem
		};

		directionsService.route(directionsRequest, (function (response, status) { // this-keyword was null when arrow function was used
			if (status === google.maps.DirectionsStatus.OK) {
				this.directionsDisplay.setMap(this.map);
					this.directionsDisplay.setPanel(this.directionElement); // this.directionElement is from DOM via ref
					this.directionsDisplay.setDirections(response);
				} else {
					let x = 0;
				}

			}).bind(this));

	}

}