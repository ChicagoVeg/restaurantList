import React from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import conversion from '../services/conversion';
import topics from '../services/topics';
import MapProviderBase from './mapProviderBase';

// Codebase has lot of experiment-code. It needs cleaning.

/**
 *
 * Based on: https://stackoverflow.com/a/51437173/178550
 *
 * @export
 * @class GoogleMaps
 * @extends {Component}
 */
export class GoogleMaps extends MapProviderBase {
  constructor(props) {
    super(props);

    this.setInfoWindow = this.setInfoWindow.bind(this);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.updateUserAddress = this.updateUserAddress.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    this.setDirectionsOnMap = this.setDirectionsOnMap.bind(this);
    this.travelModeUpdated = this.travelModeUpdated.bind(this);
    this.directionRefUpdated = this.directionRefUpdated.bind(this);
    this.filterRestaurants = this.filterRestaurants.bind(this);
    this.setAutocomplete = this.setAutocomplete.bind(this);
    this.getAddressFromLatAndLng = this.getAddressFromLatAndLng.bind(this);

    // TODO: move these to map.js
    PubSub.subscribe(topics.ThirdPartyProviderReceiveSelectedRestaurant, this.restaurantSelected);
    PubSub.subscribe(topics.ThirdPartyProviderUserAddressUpdated, this.updateUserAddress);
    PubSub.subscribe(topics.ThirdPartyProviderMapInitDetailsAvailable, this.loadFullMap);
    PubSub.subscribe(topics.ThirdPartyProviderUpdateTravelMode, this.travelModeUpdated);
    PubSub.subscribe(topics.ThirdPartyProviderDirectionRefUpdated, this.directionRefUpdated);
    PubSub.subscribe(topics.ThirdPartyProviderFilterRestaurantType, this.filterRestaurants);
    PubSub.subscribe(topics.ThirdParyProviderNeedAddressfromLatitudeAndLongitude, this.getAddressFromLatAndLng);

    this.state = {
      markers: this.props.markers,
      map: this.props.map,
      direction: {},
      destination: '',
      origin: '',
      travelMode: 'TRANSIT',
      googleMapsHasLoaded: false,
      mapIsReady: false,
    };

    this.map = null;
    this.markers = [];
    this.directionsService = null;
    this.directionsDisplay = null;
    this.destination = null;
    this.origin = null;
    this.google = null;
    this.travelMode = 'DRIVING';
    this.directionClass = null;
    this.directionsUpdated = this.props.directionsUpdated;
    this.noAddress = this.props.noAddress;
    this.newAddressFromAutoComplete = this.props.newAddressFromAutoComplete;
    this.obtainedAddressFromLatAndLng = this.props.obtainedAddressFromLatAndLng;

    // augmentation to support mapping features
    this.state.markers.map((marker) => {
      marker.showInfoWindow = false;
      return marker;
    });
  }

  setInfoWindow(flag, index) {
    const markers = this.state.markers;

    markers[index].showInfoWindow = flag;
    this.setState({
      markers,
    });
  }

  markerClicked(marker) {
    console.log('====================================');
    console.log('Maker clicked');
    marker.showInfoWindow = true;
    console.log('====================================');
  }

  restaurantSelected(message, restaurant) {
    if (message !== topics.ThirdPartyProviderReceiveSelectedRestaurant) {
      console.warn(`Received unexpected topics. Expected: ${topics.ThirdPartyProviderReceiveSelectedRestaurant}. Received: ${message}`);
    }
    const address = restaurant.address;
    const formatted_address = `${address.address}, ${address.city}, ${address.state} ${address.zip}`;
    this.destination = formatted_address;
    this.setDirectionsOnMap();
  }

  filterRestaurants(message, type) {
    if (message !== topics.ThirdPartyProviderFilterRestaurantType) {
      console.warn(`Unexpected topics. Expected: ${topics.ThirdPartyProviderFilterRestaurantType}. Received: ${message}`);
    }
    const markers = this.markers;

    if (!markers || markers.length === 0) {
      console.warn('No markers to filter');
      return;
    }

    markers.forEach((marker) => {
      if (marker.type.toLowerCase() !== type.name) {
        return;
      }
      marker.setVisible(type.checked);
    });
  }

  getAddressFromLatAndLng(message, position) {
    if (message !== topics.ThirdParyProviderNeedAddressfromLatitudeAndLongitude) {
      console.warn(`Unexpected topics. Expected: ${topics.ThirdParyProviderNeedAddressfromLatitudeAndLongitude}. Received: ${message}`);
    }

    if (!position || !position.coords) {
      console.warn('Position not found while getting address from latitide and longitude');
      return;
    }

    const {latitude, longitude} = position.coords;
    const latlng = new this.google.maps.LatLng(latitude, longitude);
    const geocoder = new this.google.maps.Geocoder();
    geocoder.geocode({
      'latLng': latlng, 
    }, (function(results, status) {
      if (status !== this.google.maps.GeocoderStatus.OK) {
        console.error(`Geocode getting address from latitude and longitude returned with an error: ${this.google.maps.GeocoderStatus}`);
        return;
      } else if (!results || !results[1]) {
        console.error('No result found');
        return;
      } 
      
      const addressComponents = results[1];
      this.origin = addressComponents.formatted_address;
      this.obtainedAddressFromLatAndLng(addressComponents);     
    }).bind(this));
  }

  updateUserAddress(message, position) {
    if (message !== topics.ThirdPartyProviderUserAddressUpdated) {
      console.warn(`Unexpected topics. Expected: ${topics.ThirdPartyProviderUserAddressUpdated}. Received: ${message}`);
    }

    this.origin = position.formatted_address;
    this.setDirectionsOnMap();
  }

  setDirectionsOnMap() {
    if (!this.origin || !this.destination) {
      console.warn(`Both origin and destination must not be falsy. Origin is: ${this.origin}. Destination is: ${this.destination}`);
      
      if (!this.origin) {
        this.noAddress();
      }
      return;
    }

    const request = {
      origin: this.origin,
      destination: this.destination,
      travelMode: this.travelMode,
    };
    this.directionsService.route(request, (function(result, status) {
      if (status === 'OK') {
        this.directionsUpdated();
        const element = window.document.querySelector(`.${this.directionClass}`);
        this.directionsDisplay.setDirections(result);
        this.directionsDisplay.setPanel(element);
      } else {
        console.error(`Error loading direction service. The error is: ${status}`);
      }
    }).bind(this));
  }

  setAutocomplete() {
    const autocompleteInit = (function () {
      const element = document.querySelector('.js-address');
      const places = new window.google.maps.places.Autocomplete(element);
      this.google.maps.event.addListener(places, 'place_changed', () => {
        const place = places.getPlace();
        this.origin = place.formatted_address;
        this.newAddressFromAutoComplete({
          'coords': {
            'latitude': place.geometry.location.lat(),
            'longitude': place.geometry.location.lng()
          }
        });
        this.setDirectionsOnMap();
      });
    }).bind(this);
    this.google.maps.event.addDomListener(window, 'load', autocompleteInit);
  }

  loadFullMap(message, mapDetails) {
    if (message !== topics.ThirdPartyProviderMapInitDetailsAvailable) {
      console.warn(`Unexpected topics. Expected: ${topics.ThirdPartyProviderMapInitDetailsAvailable}. Received: ${message}`);
    }

    this.setState(mapDetails);
    this.setState({
      mapIsReady: true,
    });
  }

  travelModeUpdated(message, travelMode) {
    if (message !== topics.ThirdPartyProviderUpdateTravelMode) {
      console.warn(`Unexpected subscripion. Provided ${message}. Expected: ${topics.ThirdPartyProviderUpdateTravelMode}`);
    }
    this.travelMode = travelMode;
    this.setDirectionsOnMap();
  }

  directionRefUpdated(message, directionClass) {
    if (message !== topics.ThirdPartyProviderDirectionRefUpdated) {
      console.warn(`Unexpected subscripion. Provided ${message}. Expected: ${topics.ThirdPartyProviderMapInitDetailsAvailable}`);
    }
    this.directionClass = directionClass;
  }

  componentDidMount() {
    const ApiKey = 'AIzaSyBtKinaroy-zATTzX5ts17OuphpmXPAq1A';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      this.setState({ googleMapsHasLoaded: true });
    });

    document.body.appendChild(script);
  }

  componentDidUpdate() {
    if (!this.state.mapIsReady || !this.state.googleMapsHasLoaded) {
      return;
    }

    const { startingLatitude, startingLongitude, zoom } = this.state.map;
    this.google = window.google;

    this.map = new this.google.maps.Map(
      document.querySelector('#js-google-map-placeholder'), {
        center: {
          lat: Number.parseFloat(startingLatitude),
          lng: Number.parseFloat(startingLongitude),
        },
        zoom: Number.parseFloat(zoom),
        mapTypeId: 'roadmap',
      },
    );

    const LatLng = this.google.maps.LatLng;
    this.state.markers.forEach((marker) => {
      const getIconDetails = conversion.getIconDetails(marker.type);
      const pin = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|${getIconDetails.colorCode}`;
      this.markers.push(new this.google.maps.Marker({
        position: new LatLng({
          lat: Number.parseFloat(marker.latitude),
          lng: Number.parseFloat(marker.longitude),
        }),
        map: this.map,
        title: marker.name,
        icon: pin,
        type: marker.type,
      }));
    });

    this.directionsService = new this.google.maps.DirectionsService();
    this.directionsDisplay = new this.google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(this.map);

    this.setAutocomplete();
  }

  render() {
    return (
      <div 
        className="map mx-auto rounded-corner" 
        id="js-google-map-placeholder"
      />
    );
  }
}

GoogleMaps.propTypes = {
  containerElement: PropTypes.element,
  googleMapURL: PropTypes.string,
  loadingElement: PropTypes.element,
  mapElement: PropTypes.element,
  markers: PropTypes.array,
  map: PropTypes.object,
};

export default GoogleMaps;
