import {inject} from "aurelia-framework";
import {RestaurantsData} from "./../data/restaurantsData";
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(RestaurantsData, EventAggregator)
export class RestaurantsList {
	constructor(restaurantsData, eventAggregator) {
		this.restaurantsData = restaurantsData;
		this.restaurants;
		this.eventAggregator = eventAggregator;
        this.selectedRestaurant = null;

		this.InitializeSubscription();
	}

	activate() {        
        return this.restaurantsData
                   .getAll()
                   .then(restaurants => this.restaurants = restaurants);
    }

    orderby(option) {
    	let x = 0; 
    	
    	return true;
    }

    InitializeSubscription() {
		const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';
		
		this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, payload => {
            let x = 0;
        });
	}

    newRestaurantSelected(restaurant) {
        this.selectedRestaurant = restaurant

        this.publishNewRestaurantSelection(restaurant);

        return true;
    }

    publishNewRestaurantSelection(restaurant) { 
        const RESTAURANTLIST_NEW_RESTAURANT_SELECTED = 'RESTAURANTLIST_NEW_RESTAURANT_SELECTED';

        this.eventAggregator.publish(RESTAURANTLIST_NEW_RESTAURANT_SELECTED, restaurant); 
    }

}