/// View Model for restaurant finder
; (function (ko, veg, console, navigator) {
    'use strict';

    veg.restaurantFinderViewModel = function () {
        var self = {};

        self.restaurants = ko.observableArray().extend({ notify: 'always' });
        self.direction = ko.observable().extend({ notify: 'always' });
        self.locationAutoDetectable = ko.observable().extend({ notify: 'always' });
        self.directionsDisplay = null;
        self.currentSelectedRestaurant = {
            restaurant: ko.observable().extend({ notify: 'always' }),
            marker: null,
            addressOnOneLine: '',
            latitude: null,
            longitude: null
        };
        self.userLocation = {
            latitude: null,
            longitude: null,
            addressOnOneLine: ''
        };
        self.restaurantMap = null;

        self.newRestaurantSelected = function (restaurant) {
            if (!restaurant) {
                console.warn('Restaurant is not a defined object. Somwthing could be wrong');
                return;
            }

            self.currentSelectedRestaurant.restaurant(restaurant);
            self.currentSelectedRestaurant.latitude = restaurant.latitude;
            self.currentSelectedRestaurant.longitude = restaurant.longitude;
            self.currentSelectedRestaurant.addressOnOneLine = restaurant.address + restaurant.City + restaurant.StateAbbreviation;
        };

        return self;
    }();
})(window.ko, window.veg, window.console, window.navigator);