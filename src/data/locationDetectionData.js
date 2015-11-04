import {inject} from "aurelia-framework";
import {HttpClient} from "aurelia-http-client";

@inject(HttpClient)
export class LocationDetectionData {
	constructor(httpClient) {
		this.httpClient = httpClient;
	}

	getLatitudeAndLongitudeFromAddress(address) {
		let baseUrl = `http://maps.googleapis.com/maps/api/geocode/json?address=${address}&sensor=false`;

		return this.httpClient.post(baseUrl)
		.then(response => {
			return response.content;
		})
	}

/*
getLatitudeAndLongitude: function getLatitudeANdLongitude(address, before, success, error, complete) {
            $.ajax({
                url:"http://maps.googleapis.com/maps/api/geocode/json?address="+address+"&sensor=false",
                type: "POST",
                before: before || _.emptyFunction,
                success: success || _.emptyFunction,
                error: error || _.emptyFunction,
                complete: complete || _.emptyFunction
            });     

*/

/*


	getById(id) {
		return this.httpClient.get(`${baseUrl}/${id}`)
		.then(response => response.content);
	}

	getAll() {
		return this.httpClient.get(baseUrl)
		.then(response => {
			return response.content;
		});
	}
	*/
}