import {inject} from "aurelia-framework";
import {Google} from './google'
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(Google, EventAggregator)
export class Map {
	constructor(Google,  eventAggregator) {
		this.Google = Google;
		this.eventAggregator = eventAggregator;
		this.map = null;
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
		
		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, payload => {
            let x = 0;
        });
	}

}

/*

this.eventAggregator.subscribe('channel name here', payload => {
            //do something with the payload here
        });

*/