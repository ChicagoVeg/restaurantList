import {inject} from "aurelia-framework";
import {RestaurantsData} from "./../data/restaurantsData";

@inject(RestaurantsData)
export class RestaurantsList {
	constructor(restaurantsData) {
		this.restaurantsData = restaurantsData;
		this.restaurants;
	}

	activate() {        
        return this.restaurantsData
                   .getAll()
                   .then(restaurants => this.restaurants = restaurants);
    }
}