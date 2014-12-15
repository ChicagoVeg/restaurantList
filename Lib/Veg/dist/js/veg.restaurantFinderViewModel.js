/// View Model for restaurant finder
; (function (ko, veg, console, navigator, _) {
    'use strict';

    veg.restaurantFinderViewModel = function () {
        var self = {};

        self.restaurants = ko.observableArray().extend({ notify: 'always' });
        self.direction = ko.observable().extend({ notify: 'always' });
        self.locationAutoDetectable = ko.observable().extend({ notify: 'always' });
        self.directionsDisplay = null;
        self.directionsService = null; 
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
        self.autoDetectedLocation = {
            latitude: null,
            longitude: null,
            addressOnOneLine: ''
        };
        self.restaurantMap = null;

        self.veganText = 'Vegan';
        self.vegetarianText = 'Vegetarian';
        self.rawVeganText = 'Raw Vegan';

        self.veganTextAbbreviation = 'VG';
        self.vegetarianTextAbbreviation = 'VT';
        self.rawVeganTextAbbreviation = 'RV';


        self.veganLegendMarkup = function () { 
            return  self.veganTextAbbreviation  + '- ' + self.veganText;
        }; 
           
        self.vegetarianLegendMarkup = function () { 
            return  self.vegetarianTextAbbreviation + '- ' +  self.vegetarianText;
        };
        
        self.rawVeganLegendMarkup = function () { 
            return self.rawVeganTextAbbreviation + '- ' + self.rawVeganText;
        };

        self.getRestaurantType = function(type) {
            var typeLowerCase = _.string.trim(type);

            if (!typeLowerCase) {
                return '';
            }

            typeLowerCase = typeLowerCase.toLowerCase();

            if (typeLowerCase === 'vegan') {
                return self.veganTextAbbreviation;
            }  else if (typeLowerCase == 'vegetarian')  {
               return self.vegetarianTextAbbreviation;
            }  else if (typeLowerCase === 'raw vegan')  {
                return self.rawVeganTextAbbreviation;
            } else {
                return  '';
            }
        };

        self.getDistanceText = function (distance) {
            if (!distance) {
                return '';
            }

            return '(' + _.string.trim(distance) + ' mi' + ')';
        }

        self.getRestaurantLegendColorClass = function (type) {
             var typeLowerCase = _.string.trim(type);

            if (!typeLowerCase) {
                return '';
            }

            typeLowerCase = typeLowerCase.toLowerCase();

            if (typeLowerCase === 'vegan') {
                return 'green';
            }  else if (typeLowerCase == 'vegetarian')  {
               return 'orange';
            }  else if (typeLowerCase === 'raw vegan')  {
                return 'blue';
            } else {
                return  '';
            }
        };

        self.isRestaurantSelected = function() {
            var selectedRestaurant = self.currentSelectedRestaurant.restaurant();
            return !!selectedRestaurant  && _.string.trim(selectedRestaurant);
        };

        self.isEmpty = function(data) {
            return !_.string.trim(data);
        };

        self.selectedRestaurantInfo = ko.computed(function() {
            var selectedRestaurant = self. currentSelectedRestaurant.restaurant(),
                address = null;

            if(!selectedRestaurant) {
                return {}
            } 

            address = selectedRestaurant.Address || {};

            return {
                "Name": selectedRestaurant.Name,
                "Url": selectedRestaurant.Url,            
                "PhoneNumber": selectedRestaurant.PhoneNumber,
                "Type": selectedRestaurant.Type, 
                "Address1": address.Address,
                "Address2": [address.City, ', ', address.StateAbbreviation, ' ',address.ZipCode ].join(''),
                "DistanceInMiles": ko.observable()
            }
        });

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
})(window.ko, window.veg, window.console, window.navigator, window._);