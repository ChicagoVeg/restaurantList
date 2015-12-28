import {inject} from "aurelia-framework";
import {Google} from './google'
import {EventAggregator} from 'aurelia-event-aggregator';
import {RestaurantsData} from "./../data/restaurantsData";
import _ from 'underscore'

@inject(Google, EventAggregator, RestaurantsData)
export class Map {
	constructor(Google,  eventAggregator, restaurantsData, locationDetectionData, _) {
		this.Google = Google;
		this.eventAggregator = eventAggregator;
		this.position = null;
		this.restaurantsData = restaurantsData;
		this.restaurantInMap = []; // preserve collection of restaurants in map
		this.userLocationMarker = null;
		this.selectedRestaurant = null; // selected restaurant, comes from a publish message from restaurant listing
		this.directionsDisplay = null // from directions.js
		this.mapProp = {
			center:new this.Google.maps.LatLng(41.878114,-87.629798),
			zoom:10,
			mapTypeId: this.Google.maps.MapTypeId.ROADMAP,
			marker: this.userLocationMarker 
		};

		this.initializeSubscription();
	}

	attached() {
		this.map = new this.Google.maps.Map(this.mapElement, this.mapProp); // this.mapElement comes from DOM via ref

		this.publishHasBeenMapInitialized(this.map); // provide reference to map to those that need it

		this.Google.maps.event.addDomListener(window, 'load', this.addUserToMap());

		this.restaurantsData
		.getAll()
		.then(restaurants => {
			restaurants.forEach(restaurant => {
				this.displayRestaurantOnMap(restaurant);
			});	
		});
	}	

	initializeSubscription() {
		this.subscriptionToPositionUpdate();	
		this.subscriptionToRestaurantListingToHide();
		this.subscriptionToRestaurantListingToShow();	
		this.subscriptionToClearDirections();
		this.subscriptionToUpdateUserPosition();
		//this.subscriptionToUserMarkerShouldBeHidden();
		this.subscriptionToRestaurantSelected();
		this.subscriptionToDirectionDisplay();
		//this.subscriptionToMapNeedUpdating();
	}

	//***********   Map operations ***********
	addUserToMap() {
		let coordinates =  { // default
			latitude: '41.878114',
			longitude: '-87.629798'
		},
		message = 'Your Present Location';

		this.userLocationMarker = new this.Google.maps.Marker({
			position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
			map: this.map,
			icon: {
				url: "http://maps.google.com/mapfiles/kml/shapes/man.png", 
			    scaledSize: new this.Google.maps.Size(30, 30), // scaled size
			    origin: new this.Google.maps.Point(0,0), // origin
			    anchor: new this.Google.maps.Point(0, 0) // anchor
			},
		});
		
		this.infoDisplay(this.userLocationMarker, message);
	}

	displayRestaurantOnMap(restaurant) {
		let coordinates = {
			latitude: restaurant.latitude,
			longitude: restaurant.longitude
		}, 
		iconUrl = null,
		message = `${restaurant.Name} (${restaurant.Type.trim()})`;

		if (restaurant.Type.toLowerCase().trim() === 'vegan') {
			iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|00FF00';
		} else if (restaurant.Type.toLowerCase().trim() === 'raw vegan') {
			iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|0000FF';
		} else {
			iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|FFA500';
		}

		this.addRestaurantToMap(coordinates, iconUrl, message, restaurant);
	}

	addRestaurantToMap(coordinates, iconUrl, message, restaurant) {	
		let latLng = new google.maps.LatLng(coordinates.latitude, coordinates.longitude), 
		markIcon = {
			url: iconUrl, 
			    origin: new this.Google.maps.Point(0,0), // origin
			    anchor: new this.Google.maps.Point(0, 0) // anchor
			},
			marker = new this.Google.maps.Marker({
				position: latLng,
				map: this.map,
				icon: markIcon
			});

			if (!!restaurant) {
			this.restaurantInMap.push({ // preserve items in map. Makes deleting markers easier
				'restaurantId' : restaurant.Id,
				'marker': marker
			});
		}

		this.infoDisplay(marker, message);
	}

	infoDisplay (marker, message) {
		let infoWindow = new this.Google.maps.InfoWindow();

		this.Google.maps.event.addListener(marker, 'click', (function (marker) {
			return function () {
			}                            
		})(marker));

		this.Google.maps.event.addListener(marker, 'mouseover', (function(marker, infoWindow) {
			return function () {

				infoWindow.setContent((['<div class="infoWindow">', typeof message === 'string' ? message.trim() : '', '</div>']).join(''));
				infoWindow.open(this.map, marker);
			};
		})(marker, infoWindow));

		this.Google.maps.event.addListener(marker, 'mouseout', (function(infoWindow) {
			return function () {
				infoWindow.close();
			};
		})(infoWindow));
	}

	update(latLng) {
		let currentLatlng = new google.maps.LatLng(latLng.lat, latLng.lng);
			
		this.userLocationMarker.setPosition(currentLatlng); // note, this may be hidden on map. It only shows when there is no direction 



		if (!this.selectedRestaurant) {
			if (!!this.directionsDisplay) {
				this.directionsDisplay.setMap(null); // ensure map is cleared
			}
			this.userLocationMarker.setVisible(true);
			// change user position
		} else {
			if (!!this.directionsDisplay) {
				this.directionsDisplay.setMap(this.map);
			}
			this.userLocationMarker.setVisible(false);
		}
	}

	//***********   Marker visibilty ***********
	setMarkerVisibility(restaurant, visibility) {
		let restaurantInMapItem = this.restaurantInMap.find(item => restaurant.Id === item.restaurantId );

		if (!restaurantInMapItem) {
			return;
		}

		//restaurantInMapItem.marker.setVisible(visibility);
	}

	//***********   Pub/Sub ***********
	publishHasBeenMapInitialized(map) {
		const MAP_MAP_INITIALIZED = 'MAP_MAP_INITIALIZED';

		this.eventAggregator.publish(MAP_MAP_INITIALIZED, map);	
	}

	subscriptionToDirectionDisplay() { //TODO: Is this needed?
		const DIRECTIONS_PROVIDE_DIRECTION_DISPLAY = 'DIRECTIONS_PROVIDE_DIRECTION_DISPLAY';

        this.eventAggregator.subscribe(DIRECTIONS_PROVIDE_DIRECTION_DISPLAY, (d => {
        	this.directionsDisplay = d;
        }).bind(this));
	}

	subscriptionToPositionUpdate() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, (latLng => {
				this.update(latLng);
			}).bind(this));
	}

	subscriptionToRestaurantListingToHide() {
		const RESTAURANTLIST_LISTING_TO_HIDE = 'RESTAURANTLIST_LISTING_TO_HIDE';

		this.eventAggregator.subscribe(RESTAURANTLIST_LISTING_TO_HIDE, (restaurants => {
			if (!restaurants) {
				return;
			}

			restaurants.forEach(restaurant => {
				this.setMarkerVisibility(restaurant, false);
			});

		}));

	}

	subscriptionToRestaurantListingToShow() {
		const RESTAURANTLIST_TO_SHOW = 'RESTAURANTLIST_TO_SHOW';

		this.eventAggregator.subscribe(RESTAURANTLIST_TO_SHOW, (restaurants => {
			if (!restaurants) {
				return;
			}

			restaurants.forEach(restaurant => {
				this.setMarkerVisibility(restaurant, true);
			});

		}));

	}

	subscriptionToUpdateUserPosition() {
		const UPDATE_USER_POSITION_IN_MAP = 'UPDATE_USER_POSITION_IN_MAP';


		this.eventAggregator.subscribe(UPDATE_USER_POSITION_IN_MAP, (position => {
			
			let latlng = new google.maps.LatLng(position.latitude, position.longitude);
				this.userLocationMarker.setPosition(latlng); // note, this may be hidden on map. It only shows when there is no direction 
			}).bind(this));


	}

	
	subscriptionToRestaurantSelected() {
		const RESTAURANTLIST_NEW_RESTAURANT_SELECTED = 'RESTAURANTLIST_NEW_RESTAURANT_SELECTED';
	
		this.eventAggregator.subscribe(RESTAURANTLIST_NEW_RESTAURANT_SELECTED, restaurant => {
			this.selectedRestaurant = restaurant;	
	
			this.userLocationMarker.setVisible(false);	
		});
	}
	
	/*
		subscriptionToMapNeedUpdating() {
			const MAP_DIRECTION_CHANGED = 'MAP_DIRECTION_CHANGED';
	
	        this.eventAggregator.subscribe(MAP_DIRECTION_CHANGED, (m =>  {
	        	m(this.map)
	        }).bind(this));
		}
		*/

	subscriptionToClearDirections() {
		const DIRECTIONS_CLEAR = 'DIRECTIONS_CLEAR';
	
		this.eventAggregator.subscribe(DIRECTIONS_CLEAR, (() => {
			//this.directionsDisplay.setMap(null);
			this.selectedRestaurant = null; // no direction, so no restaurant is selected
			this.userLocationMarker.setVisible(true); // direction cleared, so marker needs to show
		}).bind(this));
	}
	
	/*
	subscriptionToUserMarkerShouldBeHidden() {
		const USER_MAKER_SHOULD_BE_HIDDEN = 'USER_MAKER_SHOULD_BE_HIDDEN';
	
		this.eventAggregator.subscribe(USER_MAKER_SHOULD_BE_HIDDEN, () => {
		//this.userLocationMarker.setVisible(false);
		});
	}
	*/

}