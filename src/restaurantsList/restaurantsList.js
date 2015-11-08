import {inject} from "aurelia-framework";
import {RestaurantsData} from "./../data/restaurantsData";
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from './../../jspm_packages/npm/underscore@1.8.3/underscore-min.js'

@inject(RestaurantsData, EventAggregator)
export class RestaurantsList {
	constructor(restaurantsData, eventAggregator, _) {
		this.restaurantsData = restaurantsData;
		this.restaurants; // list of restaurants sorted and filter
        this.eventAggregator = eventAggregator;
        this.selectedRestaurant = null;
        this.sortBy = 'name'

        this.InitializeSubscription();
    }

    activate() {        
     this.restaurantsData
     .getAll()
     .then(restaurants => { 
        this.restaurants = restaurants.sort(this.sortByName);
    });
 }

 sortByName(r1, r2) {
    let rr1 = r1['Name'].toLocaleLowerCase().trim(), 
    rr2 = r2['Name'].toLocaleLowerCase().trim();

    return  rr1 === rr2 ? 0 : (rr1 > rr2 ? 1 : -1);
}

sortByDistance(r1, r2) {
    let rr1 = r1.distance, 
        rr2 = r2.distance;

    return  rr1 === rr2 ? 0 : (rr1 > rr2 ? 1 : -1);
}

orderBy(option) {
    if (option === 'distance') {
        this.sortBy = 'distance';
         this.restaurants = this.restaurants.sort(this.sortByDistance);
    } else {
        this.sortBy = 'name';
        this.restaurants = this.restaurants.sort(this.sortByName);
    }

    return true;
}

InitializeSubscription() {
    this.locationSubscription();   
}

locationSubscription() {
     const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

    this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, position => {
        let x = 0;

        this.restaurants.forEach(restaurant => { 
            restaurant.distance = (this.getDistanceFromLatLngInMiles( // this is a property added 
                restaurant.latitude, 
                restaurant.longitude, 
                position.latitude,
                position.longitude
            ).toFixed(2)); 
        });
    });
}

getDistanceFromLatLngInKm(lat1,lon1,lat2,lon2) {
        var R, dLat, dLon, a, c, d;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
          return 0;
        }

        R = 6371; // Radius of the earth in km
        dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        dLon = this.deg2rad(lon2-lon1); 
        a =  Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        d = R * c; // Distance in km

          return d;
      };

getDistanceFromLatLngInMiles(lat1,lon1,lat2,lon2) {
        return this.getDistanceFromLatLngInKm(lat1,lon1,lat2,lon2) * 0.6213;
      };


deg2rad(deg) {
          return deg * (Math.PI/180);
      };

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