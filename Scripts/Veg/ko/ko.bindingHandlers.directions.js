; (function (ko, $, google, toastr) {
    'use strict';

    ko.bindingHandlers.directions = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var koBindingContextRoot = bindingContext.$root;

            bindingContext.$root.directionsDisplay = new google.maps.DirectionsRenderer();
            //bindingContext.$root.directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            //bindingContext.$root.directionsDisplay.setPanel(element);

        },

        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
             directionsService = null,
             //directionsDisplay = null,
             userAddress = null,
             origin = null,
             destination = null,
             directionType = null,
             destinationAddress = null,
             request,
            koBindingContextRoot = bindingContext.$root;

            if (!value) {
                return;
            }

           // $(element).empty();

            directionType = $('input[name=directionType]:checked').first().val();

            directionsService = new google.maps.DirectionsService();
            //directionsDisplay = new google.maps.DirectionsRenderer();
            //directionsDisplay.setMap(null);
            //directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            // directionsDisplay.setPanel(element);

            bindingContext.$root.directionsDisplay.setMap(koBindingContextRoot.restaurantMap);
            bindingContext.$root.directionsDisplay.setPanel(element);

            userAddress = $('input[name=location]:checked').val() === 'manual' ?
                [$('input[name=userAddress]').val(), $('input[name=userCity]').val(), $(':selected').val(), $('input[name=userZipCode]').val()).val()].join(' ') :
                null;
            origin = !!userAddress ? userAddress : new google.maps.LatLng(koBindingContextRoot.userLocation.latitude, koBindingContextRoot.userLocation.longitude);

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
})(window.ko, window.jQuery, window.google, window.toastr);