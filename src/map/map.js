import {inject} from "aurelia-framework";
import {Google} from './google'
import {EventAggregator} from 'aurelia-event-aggregator';
import {RestaurantsData} from "./../data/restaurantsData";
import {LocationDetectionData} from './../data/locationDetectionData'
import _ from './../../jspm_packages/npm/underscore@1.8.3/underscore-min.js'

@inject(Google, EventAggregator, LocationDetectionData, RestaurantsData)
export class Map {
	constructor(Google,  eventAggregator, locationDetectionData, restaurantsData, _) {
		this.Google = Google;
		this.eventAggregator = eventAggregator;
		this.position = null;
		this.locationDetectionData = locationDetectionData;
		this.restaurantsData = restaurantsData;
		this.userLocationMarker = null;
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

		this.publishMapInitialized(this.map);

		this.Google.maps.event.addDomListener(window, 'load', this.initialize());

		this.restaurantsData
		.getAll()
		.then(restaurants => {
			restaurants.forEach(restaurant => {
                   		this.displayRestaurantOnMap(restaurant);
                   	});	
		});

	}	

	initialize() {
		let coordinates = {
			latitude: '41.878114',
			longitude: '-87.629798'
		}, 
		iconUrl = "http://maps.google.com/mapfiles/kml/shapes/man.png",
		message = 'Present Location';

		this.addItemToMap(coordinates, iconUrl, message);
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

		this.addItemToMap(coordinates, iconUrl, message);
	}

	addItemToMap(coordinates, iconUrl, message) {
		
		let userCurrentLatlng = new google.maps.LatLng(coordinates.latitude, coordinates.longitude), 
		userMarkerIcon = {
			url: iconUrl, 
			    scaledSize: new this.Google.maps.Size(30, 30), // scaled size
			    origin: new this.Google.maps.Point(0,0), // origin
			    anchor: new this.Google.maps.Point(0, 0) // anchor
			};	

		this.userLocationMarker = new this.Google.maps.Marker({
			position: userCurrentLatlng,
			map: this.map,
			icon: userMarkerIcon
		});

		this.infoDisplay(this.userLocationMarker, message);
	}

	infoDisplay (marker, message, restaurantId) {
		let infoWindow = new this.Google.maps.InfoWindow();

		this.Google.maps.event.addListener(marker, 'click', (function (marker) {
			
			return function () {

				if (!restaurantId) {
                             //   return;
                         } 

                            //$('[type="radio"][data-id="' +  restaurantId +'"]').prop('checked', true);
                            //$('[type="radio"][data-id="' + restaurantId + '"]').trigger('change');
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

	initializeSubscription() {
		this.subscribeToPositionUpdate();		
	}

	publishMapUpdate(position) { 
		const LOCATION_MAP_POSITION_UPDATED = 'LOCATION_MAP_POSITION_UPDATED';

		this.eventAggregator.publish(LOCATION_MAP_POSITION_UPDATED, this.position);	
	}

	publishMapInitialized(map) {
		const MAP_MAP_INITIALIZED = 'MAP_MAP_INITIALIZED';

		this.eventAggregator.publish(MAP_MAP_INITIALIZED, map);	
	}

	subscribeToPositionUpdate() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, (position => {
			this.position = position;

			if (this.position.locationType === 'auto') {
				this.publishMapUpdate(this.position);
				return;
			} 

			this.locationDetectionData.getLatitudeAndLongitudeFromAddress(this.position.addressOneLine)
			.then(response => {
				let place = response.content.results[0];

				if (!place || !place.geometry) {
					return;
				}

				this.position.latitude = place.geometry.lat;
				this.position.longitude = place.geometry.lng;

					this.publishMapUpdate(this.position); // this is needed, its in a callback
				});
		}).bind(this));
	}
}