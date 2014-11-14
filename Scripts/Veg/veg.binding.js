; (function (ko, $, restaurantFinderViewModel, restaurantFinderDataAccess) {
    'use strict';

    $(function () {
        var success = function (data) {
            restaurantFinderViewModel.restaurants(data);
            ko.applyBindings(restaurantFinderViewModel);
        },

        error = function() {        	
        };
        
        $('.s-currentYear').text(new Date().getFullYear());
        $('.s-pageTitle').text('ChicagoVeg');

        restaurantFinderDataAccess.get(null, success, error, null);
    });
})(window.ko, window.jQuery, window.veg.restaurantFinderViewModel, window.veg.restaurantFinderDataAccess);