import {inject, customAttribute} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@customAttribute('searchlocation')
@inject(Element, EventAggregator)
export class SearchLocation {
	constructor(element, eventAggregator) {
		this.element = element;
		this.eventAggregator = eventAggregator;
	}

	valueChanged(position){
		position.locationType = document.querySelector('[name="location"]:checked').value === 'manual' ? 'manual' : 'auto';

		if (position.locationType === "auto") {
			// restore auto-detected values
			position.latitude = position.autoDectedLatitude;
			position.longitude = position.autoDetectedLongitude;

		} else {
			position.address = {
				street: document.querySelector('[name="userAddress"]').value.trim(), 
				city: document.querySelector('[name="userCity"]').value.trim(),
				state: document.querySelector('option[selected]').text.trim(),
				zip: document.querySelector('[name="userZipCode"]').value.trim()
			}

			position.addressOneLine = [position.address.street, position.address.city, position.address.state, position.address.zip].join(' ');
		}
		this.publish(position);		
	}

	publish(position) {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.publish(LOCATION_UPDATED_EVENT , position);		
	}
}