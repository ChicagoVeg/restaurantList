import { inject } from "aurelia-framework";
import { RestaurantsData } from "./../data/restaurantsData";
import { EventAggregator } from 'aurelia-event-aggregator';
import {computedFrom} from 'aurelia-framework';
import _ from 'underscore'

@inject(RestaurantsData, EventAggregator)
export class RestaurantsList {
    constructor(restaurantsData, eventAggregator, _) {
        this.restaurantsData = restaurantsData; // means of getting all restaurants
        this.restaurants; // list of restaurants sorted and filtered, NOT meant for display
        this.restaurantsDisplayedOnScreen = []; // meant for display. Used so that UI is not unintentionally updated everytime this.restaurants get updated (e.g when distance is getting calculated)
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
            .then((restaurants => {
                this.restaurants = _.map(restaurants,  _.clone); // for displaying. Code made this way for deep copying (http://stackoverflow.com/a/21003060/178550)

                // add properties 
                this.restaurants.forEach(restaurant => {
                    restaurant.isVisible = true;
                    restaurant.distance = 0.0;
                });

                this.restaurantsDisplayedOnScreen = _.map(this.restaurants,  _.clone);

            }).bind(this));
    }

    @computedFrom('restaurantsDisplayedOnScreen')
    get restaurantList() {
        return this.restaurantsDisplayedOnScreen.filter(r => r.isVisible === true);
    }

    set restaurantList(value) {
        this.restaurantsDisplayedOnScreen = value;
    }

    updateRestaurantListUI() {
        this.restaurantList = _.clone(this.restaurants); // for the reference to change, so the object changes
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
        this.updateRestaurantListUI();

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

        this.restaurants.forEach(restaurant => {
            if (restaurant.Type.toLocaleLowerCase() === type) {
                restaurant.isVisible = true; 
            }
        });

        this.orderBy(option); // re-sort
        this.updateRestaurantListUI();
        this.publishRestaurantListing();
    }

    removeTypeFromList(type) {        
        if (!type) {
            return;
        }

        this.restaurants.forEach(restaurant => {
            if (restaurant.Type.toLocaleLowerCase() === type) {
                restaurant.isVisible = false; 
            }
        });

        this.updateRestaurantListUI();
        this.publishRestaurantListing();
    }

    //***********   Pub/Sub ***********
    InitializeSubscription() {
        this.subscriptionToNewPosition();
    }

    subscriptionToNewPosition() {
        const LOCATION_UPDATED_EVENT = 'LOCATION_UPDATED_EVENT';

        this.eventAggregator.subscribe(LOCATION_UPDATED_EVENT, (latLng => {
            let x = 0;

            this.restaurants.forEach(restaurant => {
                restaurant.distance = (this.getDistanceFromLatLngInMiles( // this is a property added 
                    restaurant.latitude,
                    restaurant.longitude,
                    latLng.lat,
                    latLng.lng
                )).toFixedNumber(2);
            });

            if (this.sortBy === 'distance') {
                this.restaurants.sort(this.sortByDistance);
            } else {
                this.restaurants.sort(this.sortByName);
            }

            this.updateRestaurantListUI();

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

    publishRestaurantListing() {
        const RESTAURANTLIST_TO_SHOW = 'RESTAURANTLIST_TO_SHOW';

        this.eventAggregator.publish(RESTAURANTLIST_TO_SHOW, _.clone(this.restaurants));   
    }

    //***********   New Restaurant selected ***********
    newRestaurantSelected(restaurant) {
        this.selectedRestaurant = restaurant

        this.publishNewRestaurantSelection(restaurant);

        return true;
    }

    //***********   Awards/Sponsors ***********
    isGoldSponsor(restaurant) {
        return !!restaurant && !!restaurant.Sponsor && restaurant.Sponsor.toLocaleLowerCase().trim() === 'gold';
    }

    isBestInTownAwardRunnerUp(restaurant) {
        return !!restaurant && !!restaurant.BestInTownAward && restaurant.BestInTownAward.toLocaleLowerCase().trim()  === 'runnerup';
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