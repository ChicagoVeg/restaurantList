; (function (ko, google, navigator, toastr, _, Modernizr) {
    'use strict';

    ko.bindingHandlers.googleMap = {
        // Creates the map and marks the user's location on it
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var root = bindingContext.$root,
                defaultCoordinates = {
                    latitude: '41.88030058331521',
                    longitude: '-87.62414216995239'
                },
                marker = null,
                infowindow,
                i,
                infoDisplay = function (marker, map, message) {
                        google.maps.event.addListener(marker, 'click', (function (marker) {
                            return function () {
                                infowindow.setContent(message);
                                infowindow.open(map, marker);
                            };
                        })(marker, i));
                }, 
                mapOptions = {
                        zoom: 10,
                        center: new google.maps.LatLng(defaultCoordinates.latitude, defaultCoordinates.longitude),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                },                   
                drawUserLocationOnMap = function (root, mapOptions, infoDisplay) {
                    var userCurrentLatlng = new google.maps.LatLng(defaultCoordinates.latitude, defaultCoordinates.longitude),                        
                        marker = null,
                        infowindow,
                        i;

                        infowindow = new google.maps.InfoWindow();

                        // current location
                        marker = new google.maps.Marker({
                           position: userCurrentLatlng,
                           map: root.restaurantMap
                       });

                       infoDisplay(marker, root.restaurantMap, 'You are here');
                };

                root.restaurantMap = new google.maps.Map(element, mapOptions); //  this is preserved
                infowindow = new google.maps.InfoWindow(),
                   
                // restaurants
                _.each(root.restaurants(), function (value) {
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(value.latitude, value.longitude),
                        map: root.restaurantMap
                    });

                    infoDisplay(marker, root.restaurantMap, value.Name);
                 });


            // Set default location
            if (!Modernizr.geolocation) {
                var latLng = new google.maps.LatLng(defaultCoordinates.latitude, defaultCoordinates.longitude); // pick some location in Chicago
                root.locationAutoDetectable(false);                       
            } else {
                root.locationAutoDetectable(true);

                navigator.geolocation.getCurrentPosition(
                    _.bind(function (position) { // user allowed access to location
                        root.userLocation.latitude = position.coords.latitude;
                        root.userLocation.longitude = position.coords.longitude;                        
                        drawUserLocationOnMap(root, mapOptions, infoDisplay);
                        $('[value="auto"]').prop('checked', true);
                        toastr.info('Your browser supports geolocation and current location has been identified. No need to add your address');
                    }, { root: root, drawUserLocationOnMap: drawUserLocationOnMap, mapOptions: mapOptions, infoDisplay: infoDisplay }),
                    _.bind(function () { // user disallowed access to location. Bummer!
                        // some location in Chicago
                        root.userLocation.latitude = defaultCoordinates.latitude;
                        root.userLocation.longitude = defaultCoordinates.longitude;
                        drawUserLocationOnMap(root, mapOptions, infoDisplay);
                        $('[value="manual"]').prop('checked', true);
                        toastr.info('Permission to use geolocation was denied. An present location was selected automatically');
                    }, { root: root, drawUserLocationOnMap: drawUserLocationOnMap, defaultCoordinates: defaultCoordinates, mapOptions: mapOptions, infoDisplay: infoDisplay }));
            }
        },

        // Marks restaurants
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
                root = bindingContext.$root,
                direction = ko.unwrap(allBindings()).updateDirection,
                latLng = null,
                marker = null;

            if (!value) {
                return;
            }

            latLng = new google.maps.LatLng(value.latitude, value.longitude);
            marker = root.currentSelectedRestaurant.marker;

            if (marker !== null) {
                //    marker.setMap(null); // delete old marker
            }

            // create new marker
            root.currentSelectedRestaurant.marker = new google.maps.Marker({
                position: latLng,
                map: root.restaurantMap,
                title: value.Name
            });

            direction(true);
        }
    };
})(window.ko, window.google, window.navigator, window.toastr, window._, window.Modernizr);