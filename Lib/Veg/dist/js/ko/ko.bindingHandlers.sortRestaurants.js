; (function (ko, $, isNaN, Number) {
    'use strict';

    ko.bindingHandlers.sortRestaurants = {
        init: function (element, valueAccessor, allBindings, vm, bindingContext) {

            $(element).on('click', {valueAccessor: valueAccessor, bindingContext: bindingContext}, function (e) {
                var value = ko.unwrap(valueAccessor()), 
                    restaurants = e.data.bindingContext.$data.restaurants;

                restaurants.sort(function(left, right) {
                    var field = value === "name" ? 'Name' : 'DistanceInMiles',
                        leftField = ko.unwrap(left[field]),
                        rightField = ko.unwrap(right[field]),
                        leftNumber = Number(leftField),
                        rightNumber = Number(rightField);

                        $('[role="Sorter"] > span[role="ByDistance"] ,[role="ByName"]').removeClass('activeSorter');
                        $('[role="Sorter"] > span[role="' +  (field === "Name" ? 'ByName' : 'ByDistance')  + '"]').addClass('activeSorter');
                        
                    // this is done so method can support both numbers and strings
                    leftField = isNaN(leftNumber) ? leftField : leftNumber;
                    rightField = isNaN(rightNumber) ? rightField : rightNumber;

                    return leftField === rightField ? 0 : (leftField < rightField ? -1 : 1);
                });
            });
        }
    };
})(window.ko, window.jQuery, window.isNaN, window.Number);
