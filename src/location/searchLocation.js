import {inject, customAttribute} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LocationDetectionData} from './../data/locationDetectionData';
import _ from 'underscore';
import bootbox from 'bootbox';

@customAttribute('searchlocation')
@inject(Element, EventAggregator, LocationDetectionData)
export class SearchLocation {
	constructor(element, eventAggregator, locationDetectionData) {
		this.element = element;
		this.eventAggregator = eventAggregator;
		this.locationDetectionData = locationDetectionData;
		this.latLng; 
	}

	valueChanged(position){
		let alertAddressTitle = 'Error with Address', 
			selectedCheckBox = document.querySelector('[name="location"]:checked');

		if (!selectedCheckBox) {
			bootbox.alert({
				"title": 'Error with Address',
				"message": "No address option is selected"
			});

			return;
		}

		position.locationType = selectedCheckBox.value === 'manual' ? 'manual' : 'auto';

		if (position.locationType === "auto") {
			this.latLng = {
					'lat': position.autoDectedLatitude,
					'lng': position.autoDetectedLongitude
				};

			this.publishNewLocation(this.latLng);

			return; // stop code from proceeding
		} 

		// need to find latitude and longitude
		position.address = {
			street: document.querySelector('[name="userAddress"]').value.trim(), 
			city: document.querySelector('[name="userCity"]').value.trim(),
			state: document.querySelector('option[selected]').text.trim(),
			zip: document.querySelector('[name="userZipCode"]').value.trim()
		}

		position.addressOneLine = [position.address.street, position.address.city, position.address.state, position.address.zip].join(' ');		

		this.locationDetectionData.getLatitudeAndLongitudeFromAddress(position.addressOneLine) 
			.then((response => {
				let place;

				if (!response || !response.results || response.status !== 'OK') {
					bootbox.alert({
						"title": alertAddressTitle,
						"message": "Google Maps could not find address"
					});

					return;
				}

				place = response.results[0];

				if (!place || !place.geometry || !place.geometry.location) {
					bootbox.alert({
						"title": alertAddressTitle,
						"message": "Google Maps could not find address geometric coordinates"
					});
					return;
				}

				this.latLng = {
					'lat': place.geometry.location.lat,
					'lng': place.geometry.location.lng 
				};

				this.publishNewLocation(this.latLng);

			}).bind(this));
	}

	publishNewLocation(latLng) {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.publish(LOCATION_UPDATED_EVENT , _.clone(this.latLng));		
	}
}