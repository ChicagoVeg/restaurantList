; (function (ko, google, navigator, toastr, _, Modernizr, $, veg) {
    'use strict';

    ko.bindingHandlers.googleMap = {
        // Creates the map and marks the user's location on it
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var root = bindingContext.$root,
                defaultCoordinates = {
                    latitude: '41.878114',
                    longitude: '-87.629798'
                },
                marker = null,
                infowindow,
                i,
                infoDisplay = function (marker, map, message, restaurantId) {
                        google.maps.event.addListener(marker, 'click', (function (marker) {
                           return function () {
                            if (!restaurantId) {
                                return;
                            } 

                            $('[type="radio"][data-id="' +  restaurantId +'"]').prop('checked', true);
                            $('[type="radio"][data-id="' + restaurantId + '"]').trigger('change');
                           }                            
                        })(marker, i));

                        google.maps.event.addListener(marker, 'mouseover', (function(marker) {
                            return function () {
                               infowindow.setContent((['<div class="infoWindow">', _.string.trim(message), '</div>']).join(''));
                               infowindow.open(map, marker);
                           };
                        })(marker, i));

                        google.maps.event.addListener(marker, 'mouseout', (function() {
                            return function () {
                                infowindow.close();
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
                        i,
                        redPinIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|FF0000', 
                                new google.maps.Size(21, 34),
                                new google.maps.Point(0,0),
                                new google.maps.Point(10, 34));

                        infowindow = new google.maps.InfoWindow();

                        // current location
                        marker = new google.maps.Marker({
                           position: userCurrentLatlng,
                           map: root.restaurantMap,
                           icon: redPinIcon
                       });

                       infoDisplay(marker, root.restaurantMap, 'You are here');
                };
                
                root.restaurantMap = new google.maps.Map(element, mapOptions); //  this is preserved
                infowindow = new google.maps.InfoWindow();
               
                   
                // restaurants
                _.each(root.restaurants(), function (restaurant) {
                    var pinIcon = ko.bindingHandlers.googleMap.getPinIcon(restaurant.Type),   
                        latitudeLongitude = veg.latitudeLongitude();                     

                    //set marker    
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(restaurant.latitude, restaurant.longitude),
                        map: root.restaurantMap, 
                        icon: pinIcon
                    });

                    //set distance
                    if (!restaurant.DistanceInMiles) {
                        restaurant.DistanceInMiles = ko.observable();
                    }
                    restaurant.DistanceInMiles(latitudeLongitude.getDistanceInMiles(root.userLocation.latitude,  root.userLocation.longitude, restaurant.latitude, restaurant.longitude));
                       

                    infoDisplay(marker, root.restaurantMap, restaurant.Name, restaurant.Id);
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
                marker = null,
                restaurantId = null;

            if (!value) {
                return;
            }

            latLng = new google.maps.LatLng(value.latitude, value.longitude);
            marker = root.currentSelectedRestaurant.marker;

            if (marker !== null) {
                    marker.setMap(null); // delete old marker
            }

            // create new marker
            root.currentSelectedRestaurant.marker = new google.maps.Marker({
                position: latLng,
                map: root.restaurantMap,
                title: value.Name
            });

            direction(true);
        },

        getPinIcon: function(restaurantType) {
        var trimmedRestaurantType = _.string.trim(restaurantType), 
            pinIcon = null,
            size = new google.maps.Size(21, 34),
            startPoint = new google.maps.Point(0,0),
            endPoint = new google.maps.Point(10, 34),
            greenPinIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|00FF00', 
                                size,
                                startPoint,
                                endPoint),
            bluePinIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|0000FF', 
                                size,
                                startPoint,
                                endPoint),
            orangePinIcon = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|FFA500', 
                                size,
                                startPoint,
                                endPoint); 

            if (!trimmedRestaurantType || trimmedRestaurantType.toLowerCase() === 'vegetarian') {
                pinIcon = orangePinIcon;
            }  else if (trimmedRestaurantType.toLowerCase() === 'raw vegan') {
                pinIcon = bluePinIcon;
            }   else {
                pinIcon = greenPinIcon;
            } 

            return pinIcon
        }
    }
})(window.ko, window.google, window.navigator, window.toastr, window._, window.Modernizr, window.jQuery, window.veg);