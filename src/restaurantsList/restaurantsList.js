import { inject } from "aurelia-framework";
import { RestaurantsData } from "./../data/restaurantsData";
import { EventAggregator } from 'aurelia-event-aggregator';
import _ from 'underscore'

@inject(RestaurantsData, EventAggregator)
export class RestaurantsList {
    constructor(restaurantsData, eventAggregator, _) {
        this.restaurantsData = restaurantsData; // means of getting all restaurants
        this.restaurantsMainSource; // all restaurants, unfiltered and unsorted, not meant for display
        this.restaurants; // list of restaurants sorted and filtered, meant for display
        this.eventAggregator = eventAggregator;
        this.selectedRestaurant = null;
        this.sortBy = 'distance';

        this.isVeganRestaurantsVisible = true;
        this.isVegetarianRestaurantsVisible = true;
        this.isRawRestaurantsVisible = true;

        this.InitializeSubscription();
    }

    activate() {
        this.restaurantsData
            .getAll()
            .then(restaurants => {
                this.restaurantsMainSource = restaurants; // reference to all restaurants
                this.restaurants = _.map(this.restaurantsMainSource,  _.clone); // for displaying. Code made this way for deep copying (http://stackoverflow.com/a/21003060/178550)
            });
    }

    //***********   Sorting ***********
    sortByName(r1, r2) {
        let rr1 = r1['Name'].toLocaleLowerCase().trim(),
        rr2 = r2['Name'].toLocaleLowerCase().trim();

        return rr1 === rr2 ? 0 : (rr1 > rr2 ? 1 : -1);
    }

    sortByDistance(r1, r2) {
        let rr1 = r1.distance,
        rr2 = r2.distance;

        return rr1 === rr2 ? 0 : (rr1 > rr2 ? 1 : -1);
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

    //***********   Filtering ***********
    //TODO: Place logging in its own file
    filter(type) {
        let addToList = null, 
            isDirectionsToBeCleared = !!this.selectedRestaurant && !!this.selectedRestaurant.Type && this.selectedRestaurant.Type.toLocaleLowerCase() === type;

        if (!type) { // type must be set
            if (window && window.console && window.console.log) {
                window.console.log('Attempting to filter when there is no valid filter');
            }
            return;
        }

        type = type.toLocaleLowerCase().trim();

        if (type === 'vegetarian') {
            this.isVegetarianRestaurantsVisible = !this.isVegetarianRestaurantsVisible;
            addToList = this.isVegetarianRestaurantsVisible;
        } else if (type === 'vegan') {
            this.isVeganRestaurantsVisible = !this.isVeganRestaurantsVisible;
            addToList = this.isVeganRestaurantsVisible;
        } else if (type === 'raw vegan') {
            this.isRawRestaurantsVisible = !this.isRawRestaurantsVisible;
            addToList = this.isRawRestaurantsVisible;
        } else {
            if (window && window.console && window.console.log) {
                window.console.log('Attempting to filter when there is no valid filter');
            }
            return true; // stop code from proceeding and also be in compliance with https://github.com/aurelia/binding/issues/19
        }

        if (addToList) {
            this.addTypeToList(type);
        } else {
            this.removeTypeFromList(type);
        }
        
        if (isDirectionsToBeCleared) {
           // this.publishNewRestaurantSelection(null);
           this.selectedRestaurant = null; 
           this.publishToClearDirections();
        }


        return true; // needed due to https://github.com/aurelia/binding/issues/19
    }

    addTypeToList(type) {
        let restaurantToAdd = [],
            option = this.sortBy === 'distance' ? 'distance' : 'name';

        if (!type) {
            return;
        }

        restaurantToAdd = this.restaurantsMainSource.filter(r => r.Type.toLocaleLowerCase() === type); // get type of restaurant from unfiltered source
        
        this.restaurants = this.restaurants.concat(restaurantToAdd);
        this.orderBy(option); // re-sort
        this.publishRestaurantListingToShow(restaurantToAdd);
    }

    removeTypeFromList(type) {        
        if (!type) {
            return;
        }

        this.restaurants = this.restaurants.filter(r => r.Type.toLocaleLowerCase() !== type);
        this.publishRestaurantListingToHide(this.restaurantsMainSource.filter(r => r.Type.toLocaleLowerCase() === type));
    }

    //***********   Pub/Sub ***********
    InitializeSubscription() {
        this.subscriptionToNewPosition();
    }

    subscriptionToNewPosition() {
        const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

        this.eventAggregator.subscribe((LOCATION_UPDATED_EVENT, position => {
            let x = 0;

            this.restaurants.forEach(restaurant => {
                restaurant.distance = (this.getDistanceFromLatLngInMiles( // this is a property added 
                    restaurant.latitude,
                    restaurant.longitude,
                    position.latitude,
                    position.longitude
                )).toFixedNumber(2);
            });

            if (this.sortBy === 'distance') {
                this.restaurants.sort(this.sortByDistance);
            }

            // calcuate distances in main collection too
            this.restaurantsMainSource.forEach(restaurant => {
                restaurant.distance = (this.getDistanceFromLatLngInMiles( // this is a property added 
                    restaurant.latitude,
                    restaurant.longitude,
                    position.latitude,
                    position.longitude
                )).toFixedNumber(2);
            });

        }).bind(this));
    }

    publishToClearDirections() {
        const DIRECTIONS_CLEAR = 'DIRECTIONS_CLEAR';

        this.eventAggregator.publish(DIRECTIONS_CLEAR);
    }

    publishNewRestaurantSelection(restaurant) {
        const RESTAURANTLIST_NEW_RESTAURANT_SELECTED = 'RESTAURANTLIST_NEW_RESTAURANT_SELECTED';

        this.eventAggregator.publish(RESTAURANTLIST_NEW_RESTAURANT_SELECTED, _.clone(restaurant));
    }

    publishRestaurantListingToHide(restaurants) {
        const RESTAURANTLIST_LISTING_TO_HIDE = 'RESTAURANTLIST_LISTING_TO_HIDE';

        this.eventAggregator.publish(RESTAURANTLIST_LISTING_TO_HIDE, _.clone(restaurants));   
    }

    publishRestaurantListingToShow(restaurants) {
        const RESTAURANTLIST_TO_SHOW = 'RESTAURANTLIST_TO_SHOW';

        this.eventAggregator.publish(RESTAURANTLIST_TO_SHOW, _.clone(restaurants));   
    }

    //***********   New Restaurant selected ***********
    newRestaurantSelected(restaurant) {
        this.selectedRestaurant = restaurant

        this.publishNewRestaurantSelection(restaurant);

        return true;
    }

    //***********   Distance ***********
    // Based on: http://stackoverflow.com/a/27943/178550
    getDistanceFromLatLngInKm(lat1, lon1, lat2, lon2) {
        var R, dLat, dLon, a, c, d;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
            return 0;
        }

        R = 6371; // Radius of the earth in km
        dLat = this.deg2rad(lat2 - lat1); // deg2rad below
        dLon = this.deg2rad(lon2 - lon1);
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        d = R * c; // Distance in km

        return d;
    };

    getDistanceFromLatLngInMiles(lat1, lon1, lat2, lon2) {
        return this.getDistanceFromLatLngInKm(lat1, lon1, lat2, lon2) * 0.6213;
    };


    deg2rad(deg) {
        return deg * (Math.PI / 180);
    };

}