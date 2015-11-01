import {inject} from "aurelia-framework";
import {Google} from './google'

@inject(Google)
export class Map {
	constructor(Google) {
		this.Google = Google;
		this.map = null;
		this.mapProp = {
			center:new this.Google.maps.LatLng(51.508742,-0.120850),
			zoom:5,
			mapTypeId: this.Google.maps.MapTypeId.ROADMAP
		};
	}

	attached() {
		this.Google.maps.event.addDomListener(window, 'load', this.initialize());
	}	

	initialize() {
		this.map = new this.Google.maps.Map(this.mapElement, this.mapProp); // this.mapElement comes from DOM via ref
	}
}