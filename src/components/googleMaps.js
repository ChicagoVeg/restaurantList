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
    this.loadFullMap = this.loadFullMap.bind(this);
    this.setDirectionsOnMap = this.setDirectionsOnMap.bind(this);
    this.travelModeSelected = this.travelModeSelected.bind(this);
    this.filterRestaurants = this.filterRestaurants.bind(this);
    this.setAutocomplete = this.setAutocomplete.bind(this);
    this.getAddressFromLatAndLng = this.getAddressFromLatAndLng.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.newAddressFromAutoComplete = this.newAddressFromAutoComplete.bind(this);
    this.autocompleteInit = this.autocompleteInit.bind(this);
    this.noAddress = this.noAddress.bind(this);
    this.obtainedAddressFromLatAndLng = this.obtainedAddressFromLatAndLng.bind(this);
 
    // TODO: move these to map.js
    PubSub.subscribe(topics.restaurantSelected, this.restaurantSelected);
    PubSub.subscribe(topics.mapInitDetailsAvailable, this.loadFullMap);
    PubSub.subscribe(topics.needAddressfromLatitudeAndLongitude, this.getAddressFromLatAndLng);

    this.state = {
      markers: [],
      map: {
        startingLatitude: 41.954420,
        startingLongitude: -87.669250,
        zoom: 3,
      },
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
    this.google = {};
    this.travelMode = 'DRIVING';
    this.directionClass = null;

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
    marker.showInfoWindow = true;
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

  filterRestaurants(type) {
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

  obtainedAddressFromLatAndLng(addressComponent) {
    PubSub.publish(topics.gotAddressFromLatitudeAndLongitude, addressComponent.formatted_address);
  }

  noAddress() {
    if (this.isAutoDetected) {
      return;
    }

    const warning = 'Address needed. Auto detect it or select one from the address box'; 
    PubSub.publish(topics.warningNotification, warning);
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
        const element = this.refs.directions;
        this.directionsDisplay.setDirections(result);
        this.directionsDisplay.setPanel(element);
      } else {
        console.error(`Error loading direction service. The error is: ${status}`);
      }
    }).bind(this));
  }

  newAddressFromAutoComplete(position) {
    PubSub.publish(topics.geolocationAvailable, position);
  }

  autocompleteInit() {
    const element = document.querySelector('.js-address');
    const places = new window.google.maps.places.Autocomplete(element);
    this.google.maps.event.addListener(places, 'place_changed', (function() {
      const place = places.getPlace();
      this.origin = place.formatted_address;
      this.newAddressFromAutoComplete({
        'coords': {
          'latitude': place.geometry.location.lat(),
          'longitude': place.geometry.location.lng()
        }
      });
      this.setDirectionsOnMap();
    }).bind(this));
  }

  setAutocomplete() {
    this.google.maps.event.addDomListener(window, 'load', this.autocompleteInit);
  }

  loadFullMap(message, mapDetails) {
    if (message !== topics.ThirdPartyProviderMapInitDetailsAvailable) {
      console.warn(`Unexpected topics. Expected: ${topics.ThirdPartyProviderMapInitDetailsAvailable}. Received: ${message}`);
    }

    this.setState(mapDetails);
    this.setState({
      mapIsReady: true,
    });

        // Markers contain same field as restaurants but can contains user-info,
    // So it was cloned into a new array
    const markers = mapDetails.restaurants.map(r => ({ ...r }));
    const userMaker = {
      id: 'userMaker',
      name: 'You are here',
      latitude: mapDetails.map.startingLatitude,
      longitude: mapDetails.map.startingLongitude,
      type: 'user',
    };

    markers.push(userMaker);
    this.setState({
      markers,
      map: mapDetails.map,
      mapIsReady: true,
    });

    mapDetails.markers = markers; // augment
  }

  travelModeSelected(e) {
    this.travelMode = e.currentTarget.value;
    this.setDirectionsOnMap();
  }

  restaurantTypeToggled(e) {
    const restaurantType = {
      'checked': e.target.checked,
      'name': e.target.value,
    };
    this.filterRestaurants(restaurantType);
    PubSub.publish(topics.restaurantTypeToggle, restaurantType);
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
      <div>
      <div className="card">
          <div className="card-header card-header-color">
              <i className="material-icons">map</i>
              <ul className="list-inline pull-right">
                  <li className="list-inline-item">
                      <label>
                          <input defaultChecked={true} name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="vegetarian" />
                          <span className={conversion.getColorClass( 'vegetarian')}> 
                    Vegetarian ({conversion.code('vegetarian')}) 
                  </span>
                      </label>
                  </li>
                  <li className="list-inline-item">
                      <label>
                          <input defaultChecked={true} name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="vegan" />
                          <span className={conversion.getColorClass( 'vegan')}> 
                   Vegan ({conversion.code('vegan')}) 
                  </span>
                      </label>
                  </li>
                  <li className="list-inline-item">
                      <label>
                          <input defaultChecked={true} name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="raw vegan" />
                          <span className={conversion.getColorClass( 'raw vegan')}> 
              {' '} Raw Vegan ({conversion.code('raw vegan')})
                </span>
                      </label>
                  </li>
              </ul>
          </div>
          <div className="map mx-auto rounded-corner" id="js-google-map-placeholder">
          </div>
      </div>
      <br />
      <div className="card">
          <div className="card-header card-header-color">
              <i className="material-icons">directions</i>
              <ul className="list-inline pull-right">
                  <li className="list-inline-item">
                      <label>
                          <input defaultChecked name="direction-type" onClick={this.travelModeSelected} type="radio" value="DRIVING" /> <i className="icon-shift-driving material-icons">directions_car</i>
                      </label>
                  </li>
                  <li className="list-inline-item">
                      <label>
                          <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="TRANSIT" /> <i className="icon-shift-transit material-icons">directions_transit</i>
                      </label>
                  </li>
                  <li className="list-inline-item">
                      <label>
                          <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="WALKING" /> <i className="icon-shift-walking material-icons">directions_walk</i>
                      </label>
                  </li>
                  <li className="list-inline-item">
                      <label>
                          <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="BICYCLING" /> <i className="icon-shift-bicycle material-icons">directions_bike</i>
                      </label>
                  </li>
              </ul>
          </div>
          <div className="restaurant-directions" ref="directions">
          </div>
      </div>
  </div>
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
