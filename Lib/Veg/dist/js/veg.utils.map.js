;(function (ko, veg, latitudeLongitude) {
	'use strict';

	veg.utils = {};
	veg.utils.map = {
		setDistanceInMiles: function setDistanceInMiles(restaurants, userLocationlatitude, userLocationlongitude) {
                    var distanceInMiles;

                    if (!restaurants) {
                        return;
                    }

                    // restaurants
                    _.each(ko.unwrap(restaurants), function (restaurant) {

                    if (!restaurant.DistanceInMiles) {
                        restaurant.DistanceInMiles = ko.observable();
                    }
                    
                    distanceInMiles = latitudeLongitude().getDistanceInMiles(userLocationlatitude, userLocationlongitude, restaurant.latitude, restaurant.longitude);
                    restaurant.DistanceInMiles(distanceInMiles.toFixed(2));
                    });
                }

	};
})(window.ko, window.veg, window.veg.latitudeLongitude);