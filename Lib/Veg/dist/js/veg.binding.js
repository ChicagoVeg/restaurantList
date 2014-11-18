; (function (ko, $, _, restaurantFinderViewModel, restaurantFinderDataAccess) {
    'use strict';

    $(function () {
        var success = function (data) {
            restaurantFinderViewModel.restaurants(data); 

                restaurantFinderViewModel.restaurants.sort(function(left, right) {
                    var leftName = _.string.trim(left.Name),
                        rightName= _.string.trim(right.Name);

                    return leftName === rightName ? 0 : (leftName < rightName ? -1 : 1);
                });
            ko.applyBindings(restaurantFinderViewModel);
        },

        error = function() {        	
        };
        
        $('.s-currentYear').text(new Date().getFullYear());
        $('.s-pageTitle').text('ChicagoVeg');

        restaurantFinderDataAccess.get(null, success, error, null);
    });
})(window.ko, window.jQuery, window._, window.veg.restaurantFinderViewModel, window.veg.restaurantFinderDataAccess);

/*
myObservableArray.sort(function(left, right) { return left.lastName == right.lastName ? 0 : (left.lastName < right.lastName ? -1 : 1) })
*/