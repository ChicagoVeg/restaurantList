; (function (ko, $, _) {
    'use strict';

    ko.bindingHandlers.filterRestaurants = {
        init: function (element, valueAccessor, allBindings, vm, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
                restaurants = bindingContext.$data.restaurants,
                root = bindingContext.$root;
            
            if (!value) {
                return;
            }

            $(element).on('change', { value: value, restaurants: restaurants, root: root }, function (e) {
                var data = e.data,
                    $this = $(this),  
                    checkboxValue = _.string.trim($this.val()),
                    restaurants = null, 
                    isChecked = $this.is(':checked'),
                    $checkedRestaurant
                    root = e.data.root;

                    if (!checkboxValue) {
                        return;
                    }

                    if(typeof data.restaurants !== 'function') {
                        return;
                    }

                    restaurants = data.restaurants();

                    _.each($('[role="restaurantListing"] > li'), function(li) {
                         var $li = $(li),
                            type = $li.data('restaurant-type').toLowerCase();

                         if (type !== checkboxValue) {
                            return;
                         }

                         $li[isChecked ? 'show' : 'hide']();

                         ko.contextFor($li[0]).$data.marker.setVisible(isChecked); //hide or show marker (pin) in map
                    });

                    $checkedRestaurant = $('input[name="restaurantList"]:checked');

                    // hide directions if checked restaurant is no longer visible
                    if (!$checkedRestaurant.is(':visible')) {
                        
                        
                        root.currentSelectedRestaurant.restaurant('');
                        //root.marker =  null;
                        //root.addressOnOneLine = null;
                        //root.latitude = null;
                        //root.longitude  = null;

                        $checkedRestaurant.prop('checked', false); //unchecked a now hidden restaurant
                        bindingContext.$root.directionsDisplay.setMap(null); //remove directions from map
                        bindingContext.$root.directionsDisplay.setDirections({routes: []}) // remove directions                       
                    }
            });
        }
    };
})(window.ko, window.jQuery, window._);