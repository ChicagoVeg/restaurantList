; (function (ko, $, google, toastr, _) {
    'use strict';

    ko.bindingHandlers.directions = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var koBindingContextRoot = bindingContext.$root;

            bindingContext.$root.directionsDisplay = new google.maps.DirectionsRenderer();
            bindingContext.$root.directionsService = new google.maps.DirectionsService();
            //bindingContext.$root.directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            //bindingContext.$root.directionsDisplay.setPanel(element);

        },

        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
             directionsService = bindingContext.$root.directionsService,
             //directionsDisplay = null,
             userAddress = null,
             origin = null,
             destination = null,
             directionType = null,
             destinationAddress = null,
             request,
             $nameAttribute = null,
             addressLine, city, zip,
             koBindingContextRoot = bindingContext.$root,
             isRestaurantSelected = $('input[name="restaurantList"]:checked').is(':visible');

            if (!value || !isRestaurantSelected) {
                return;
            }

           // $(element).empty();

            directionType = $('input[name=directionType]:checked').first().val();

            //directionsService = new google.maps.DirectionsService();
            //directionsDisplay = new google.maps.DirectionsRenderer();
            //directionsDisplay.setMap(null);
            //directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            // directionsDisplay.setPanel(element);

            bindingContext.$root.directionsDisplay.setDirections({routes: []}) // remove current directions
            bindingContext.$root.directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            bindingContext.$root.directionsDisplay.setPanel(element);

            $nameAttribute = $('input[name=location]:checked');

            if ($nameAttribute.length === 0 ) { //$nameAttribute.length === 0 means that geolocation is not available so always use address bar
                 addressLine = _.string.trim($('input[name=userAddress]').val());
                 city = _.string.trim($('input[name=userCity]').val()), 
                 zip = _.string.trim($('input[name=userZipCode]').val());

             if (!addressLine && !city && !zip) {
                    toastr.error('You need an address since geolocation is either not supported or access was denied');
                    return;
                }

                userAddress =  _.string.trim([addressLine, city, $('select[name="state"] :selected').val(), zip].join(' '));
                origin = userAddress;
            } else {
                userAddress =  $nameAttribute.val() === 'manual' ?
                [$('input[name=userAddress]').val(), $('input[name=userCity]').val(), $(':selected').val(), $('input[name=userZipCode]').val()].join(' ') :
                null;

                origin = !!userAddress ? userAddress : new google.maps.LatLng(koBindingContextRoot.userLocation.latitude, koBindingContextRoot.userLocation.longitude);
            }

            destinationAddress = koBindingContextRoot.currentSelectedRestaurant.addressOnOneLine;
            destination = !!destinationAddress ? destinationAddress : new google.maps.LatLng(koBindingContextRoot.currentSelectedRestaurant.restaurant().latitude, koBindingContextRoot.currentSelectedRestaurant.restaurant().longitude);

            request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.DirectionsTravelMode[directionType]
            };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    // directionsDisplay.set('directions', null);
                    koBindingContextRoot.directionsDisplay.setDirections(response);
                } else {
                    toastr.error('Error getting direction', 'could not get direction');
                }

            });
        }
    };
})(window.ko, window.jQuery, window.google, window.toastr, window._);