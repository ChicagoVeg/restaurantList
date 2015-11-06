import {inject} from "aurelia-framework";
import {Google} from './google'
import {EventAggregator} from 'aurelia-event-aggregator';
import {LocationDetectionData} from './../data/locationDetectionData'
import _ from './../../jspm_packages/npm/underscore@1.8.3/underscore-min.js'

@inject(Google, EventAggregator, LocationDetectionData)
export class Map {
	constructor(Google,  eventAggregator, locationDetectionData, _) {
		this.Google = Google;
		this.eventAggregator = eventAggregator;
		this.map = null;
		this.position = null;
		this.locationDetectionData = locationDetectionData;
		this.userLocationMarker = null;
		this.mapProp = {
			center:new this.Google.maps.LatLng(41.878114,-87.629798),
			zoom:14,
			mapTypeId: this.Google.maps.MapTypeId.ROADMAP,
			marker: this.userLocationMarker 
		};

		this.initializeSubscription();
	}

	attached() {
		this.Google.maps.event.addDomListener(window, 'load', this.initialize());
	}	

	initialize() {
		this.addUserCurrentPositionMarkerToMap();
	}

	addUserCurrentPositionMarkerToMap() {
		let defaultCoordinates = {
			latitude: '41.878114',
			longitude: '-87.629798'
		},
		userCurrentLatlng = new google.maps.LatLng(defaultCoordinates.latitude, defaultCoordinates.longitude), 
		userMarkerIcon = {
			url:"http://maps.google.com/mapfiles/kml/shapes/man.png", 
			    scaledSize: new this.Google.maps.Size(30, 30), // scaled size
			    origin: new this.Google.maps.Point(0,0), // origin
			    anchor: new this.Google.maps.Point(0, 0) // anchor
			};	

		this.map = new this.Google.maps.Map(this.mapElement, this.mapProp); // this.mapElement comes from DOM via ref

		this.userLocationMarker = new this.Google.maps.Marker({
			position: userCurrentLatlng,
			map: this.map,
			icon: userMarkerIcon
		});

		this.infoDisplay(this.userLocationMarker, 'You are here');
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