; (function (ko, $, _, dataAccess, map ) {
    'use strict';

    ko.bindingHandlers.updateAddress = {
        init: function (element, valueAccessor, allBindings, vm, bindingContext) {
          
          $(element).on('click', { bindingContext: bindingContext }, function () { 
          var root = bindingContext.$root,
                     addressLine = _.string.trim($('input[name=userAddress]').val()),
                     city = _.string.trim($('input[name=userCity]').val()), 
                     state = $('select[name="state"] :selected').val(),   
                     zip = _.string.trim($('input[name=userZipCode]').val()),
                     success = _.bind( function(res) {
                        var root = this.root,
                            restaurants = root.restaurants,
                            $distanceSorterSpan = $('[role="ByDistance"]');

                        root.userLocation.latitude = res.results[0].geometry.location.lat;
                        root.userLocation.longitude = res.results[0].geometry.location.lng;

                        root.addressOnOneLine = _.string.trim([addressLine, city, $(':selected').val(), zip].join(' '));
                        map.setDistanceInMiles(restaurants, root.userLocation.latitude, root.userLocation.longitude);

                        $('input[name="restaurantList"]:checked').trigger('change'); // update directions

                        // resort by distance
                        if ($distanceSorterSpan.hasClass('activeSorter')) {
                            $distanceSorterSpan.trigger('click')
                        }
                      
                    }, { root: root, map: map } );
            
              root.addressOnOneLine = [addressLine, city, state, zip].join(' ');  
             dataAccess.getLatitudeAndLongitude(root.addressOnOneLine, _.emptyFunction, success);
          });
        }
    };
})(window.ko, window.jQuery, window._, window.veg.restaurantFinderDataAccess, window.veg.utils.map, undefined);