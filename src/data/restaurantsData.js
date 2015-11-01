import {inject} from "aurelia-framework";
import {HttpClient} from "aurelia-http-client";

let baseUrl = "./src/data/restaurantsData.json";

@inject(HttpClient)
export class RestaurantsData {
	constructor(httpClient) {
		this.httpClient = httpClient;
	}

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
}