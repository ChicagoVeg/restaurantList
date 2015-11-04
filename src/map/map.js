import {inject} from "aurelia-framework";
import {Google} from './google'
import {EventAggregator} from 'aurelia-event-aggregator';
import {LocationDetectionData} from './../data/locationDetectionData'

@inject(Google, EventAggregator, LocationDetectionData)
export class Map {
	constructor(Google,  eventAggregator, locationDetectionData) {
		this.Google = Google;
		this.eventAggregator = eventAggregator;
		this.map = null;
		this.position = null;
		this.locationDetectionData = locationDetectionData;
		this.mapProp = {
			center:new this.Google.maps.LatLng(51.508742,-0.120850),
			zoom:5,
			mapTypeId: this.Google.maps.MapTypeId.ROADMAP
		};

		this.InitializeSubscription();
	}

	attached() {
		this.Google.maps.event.addDomListener(window, 'load', this.initialize());
	}	

	initialize() {
		this.map = new this.Google.maps.Map(this.mapElement, this.mapProp); // this.mapElement comes from DOM via ref
	}

	InitializeSubscription() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, (position => {
			this.position = position;

			if (this.position.locationType === 'auto') {
				this.publishUpdateToPosition(this.position);
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

					this.publishUpdateToPosition(this.position); // this is needed, its in a callback
				});
		}).bind(this));
	}

	publishUpdateToPosition(position) { 
		const LOCATION_MAP_POSITION_UPDATED = 'LOCATION_MAP_POSITION_UPDATED';

		this.eventAggregator.publish(LOCATION_MAP_POSITION_UPDATED, this.position);	
	}
}