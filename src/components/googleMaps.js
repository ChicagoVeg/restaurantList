import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import conversion from '../services/conversion';
import topics from '../services/topics';

// Codebase has lot of experiment-code. It needs cleaning.

/**
 *
 * Based on: https://stackoverflow.com/a/51437173/178550
 *
 * @export
 * @class GoogleMaps
 * @extends {Component}
 */
export class GoogleMaps extends Component {
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
    this.obtainedAddressFromLatAndLng = this.obtainedAddressFromLatAndLng.bind(this);

    // TODO: move these to map.js
    PubSub.subscribe(topics.restaurantSelected, this.restaurantSelected);
    PubSub.subscribe(topics.mapInitDetailsAvailable, this.loadFullMap);
    PubSub.subscribe(topics.needAddressfromLatitudeAndLongitude, this.getAddressFromLatAndLng);

    this.state = {
      markers: [], // marker value
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
    this.googleMarker = []; // reference to google marker on map
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
    const { markers } = this.state;

    markers[index].showInfoWindow = flag;
    this.setState({
      markers,
    });
  }

  markerClicked(marker) {
    marker.showInfoWindow = true;
  }

  restaurantSelected(message, restaurant) {
    if (message !== topics.restaurantSelected) {
      console.warn(`Received unexpected topics. Expected: ${topics.restaurantSelected}. Received: ${message}`);
    }
    const { address } = restaurant;
    const formatted_address = `${address.address}, ${address.city}, ${address.state} ${address.zip}`;
    this.destination = formatted_address;
    this.setDirectionsOnMap();
  }

  filterRestaurants(type) {
    const markers = this.googleMarker;

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
    if (message !== topics.needAddressfromLatitudeAndLongitude) {
      console.warn(`Unexpected topics. Expected: ${topics.needAddressfromLatitudeAndLongitude}. Received: ${message}`);
    }

    if (!position || !position.coords) {
      console.warn('Position not found while getting address from latitide and longitude');
      return;
    }

    const { latitude, longitude } = position.coords;
    const latlng = new this.google.maps.LatLng(latitude, longitude);
    const geocoder = new this.google.maps.Geocoder();
    geocoder.geocode({
      latLng: latlng,
    }, (results, status) => {
      if (status !== this.google.maps.GeocoderStatus.OK) {
        console.error(`Geocode getting address from latitude and longitude returned with an error: ${this.google.maps.GeocoderStatus}`);
        return;
      } if (!results || !results[1]) {
        console.error('No result found');
        return;
      }

      const addressComponents = results[1];
      this.origin = addressComponents.formatted_address;
      this.obtainedAddressFromLatAndLng(addressComponents);
    });
  }

  obtainedAddressFromLatAndLng(addressComponent) {
    PubSub.publish(topics.gotAddressFromLatitudeAndLongitude, addressComponent.formatted_address);
  }

  setDirectionsOnMap() {
    if (!this.origin || !this.destination) {
      console.warn(`Both origin and destination must not be falsy. Origin is: ${this.origin}. Destination is: ${this.destination}`);

      const warning = !this.destination
        ? 'Please, select a restaurant'
        : 'Please, select an address';

      PubSub.publish(topics.warningNotification, warning);
      return;
    }

    const request = {
      origin: this.origin,
      destination: this.destination,
      travelMode: this.travelMode,
    };
    this.directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        const element = this.refs.directions;
        this.directionsDisplay.setDirections(result);
        this.directionsDisplay.setPanel(element);
      } else {
        console.error(`Error loading direction service. The error is: ${status}`);
      }
    });
  }

  newAddressFromAutoComplete(position) {
    PubSub.publish(topics.geolocationAvailable, position);
  }

  autocompleteInit() {
    const element = document.querySelector('.js-address');
    const places = new window.google.maps.places.Autocomplete(element);
    this.google.maps.event.addListener(places, 'place_changed', () => {
      const place = places.getPlace();
      this.origin = place.formatted_address;
      this.newAddressFromAutoComplete({
        coords: {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        },
      });
      this.setDirectionsOnMap();
    });
  }

  setAutocomplete() {
    this.google.maps.event.addDomListener(window, 'load', this.autocompleteInit);
  }

  loadFullMap(message, mapDetails) {
    if (message !== topics.mapInitDetailsAvailable) {
      console.warn(`Unexpected topics. Expected: ${topics.mapInitDetailsAvailable}. Received: ${message}`);
    }

    this.setState(mapDetails);
    this.setState({
      mapIsReady: true,
    });

    // Markers contain same field as restaurants but can contains user-info,
    // So it was cloned into a new array
    const markers = mapDetails.restaurants.map((r) => ({ ...r }));

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
      checked: e.target.checked,
      name: e.target.value,
    };
    this.filterRestaurants(restaurantType);
    PubSub.publish(topics.restaurantTypeToggle, restaurantType);
  }

  componentDidMount() {
    /*
    const ApiKey = 'AIzaSyBtKinaroy-zATTzX5ts17OuphpmXPAq1A';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      this.setState({ googleMapsHasLoaded: true });
    });

    document.body.appendChild(script);
    */
  }

  componentDidUpdate() {
    // if (!this.state.mapIsReady || !this.state.googleMapsHasLoaded) {
    //  return;
    // }

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
        mapId: 'AIzaSyDuddOEctDmQdN_eCrcHdkV0ONH_gX8j68&', //"DEMO_MAP_ID", // Map ID is required for advanced markers.
      },
    );

    const { LatLng } = this.google.maps;
    this.state.markers.forEach((marker) => {
      const getIconDetails = conversion.getIconDetails(marker.type);
      // const pin = `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|${getIconDetails.colorCode}`;

      const icon = {
        path: 'M146.667,0C94.903,0,52.946,41.957,52.946,93.721c0,22.322,7.849,42.789,20.891,58.878c4.204,5.178,11.237,13.331,14.903,18.906c21.109,32.069,48.19,78.643,56.082,116.864c1.354,6.527,2.986,6.641,4.743,0.212c5.629-20.609,20.228-65.639,50.377-112.757c3.595-5.619,10.884-13.483,15.409-18.379c6.554-7.098,12.009-15.224,16.154-24.084c5.651-12.086,8.882-25.466,8.882-39.629C240.387,41.962,198.43,0,146.667,0z M146.667,144.358			c-28.892,0-52.313-23.421-52.313-52.313c0-28.887,23.421-52.307,52.313-52.307s52.313,23.421,52.313,52.307 C198.98,120.938,175.559,144.358,146.667,144.358z',
        fillColor: `${getIconDetails.colorCode}`,
        color: `${getIconDetails.colorCode}`,
        fillOpacity: 1,
        anchor: new google.maps.Point(0, 0),
        strokeWeight: 1,
        scale: 0.1,
      };

      const pinBackground = new this.google.maps.marker.PinElement({
        background: `${getIconDetails.colorCode}`,
        borderColor: `${getIconDetails.colorCode}`,
        glyphColor: '#FFFFFF',
        scale: 0.8,
      });

      const gmMarker = new this.google.maps.marker.AdvancedMarkerElement({
        position: new LatLng({
          lat: Number.parseFloat(marker.latitude),
          lng: Number.parseFloat(marker.longitude),
        }),
        map: this.map,
        title: marker.name,
        content: pinBackground.element,
      });
      gmMarker.addListener('click', (function () {
        // note, this == maker, based on .bind
        const element = document.querySelector(`input[name="restaurant-selected"][value="${this.id}"]`);

        if (element) {
          element.click();
        } else {
          console.warn('Invalid id passed to google marker click event');
        }
      }).bind(marker));

      this.googleMarker.push(gmMarker);
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
          <div className="card-header card-header-color pb-0">
            <i className="material-icons" title="map">map</i>
            <ul className="list-inline pull-right mb-0">
              <li className="list-inline-item" title="Filter on Vegetarian">
                <label>
                  <input defaultChecked name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="vegetarian" />
                  <span className={conversion.getColorClass('vegetarian')}>
                    Vegetarian (
                    {conversion.code('vegetarian')}
                    )
                  </span>
                </label>
              </li>
              <li className="list-inline-item" title="Filter on Vegan">
                <label>
                  <input defaultChecked name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="vegan" />
                  <span className={conversion.getColorClass('vegan')}>
                    Vegan (
                    {conversion.code('vegan')}
                    )
                  </span>
                </label>
              </li>
              <li className="list-inline-item" title="Filter on Raw Vegan">
                <label>
                  <input defaultChecked name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="raw vegan" />
                  <span className={conversion.getColorClass('raw vegan')}>
                    {' '}
                    {' '}
                    Raw Vegan (
                    {conversion.code('raw vegan')}
                    )
                  </span>
                </label>
              </li>
              <li className="list-inline-item" title="Filter on Not Verified">
                <label>
                  <input defaultChecked name="restaurantType" onChange={this.restaurantTypeToggled} type="checkbox" value="not verified" />
                  <span className={conversion.getColorClass('not verified')}>
                    {' '}
                    {' '}
                    Not Verified (
                    {conversion.code('not verified')}
                    )
                  </span>
                </label>
              </li>
            </ul>
          </div>
          <div className="map mx-auto rounded-corner" id="js-google-map-placeholder" />
        </div>
        <div className="contact-us">
          <a href="https://www.chicagoveg.com/contact.html" target="_blank" rel="noopener noreferrer">Contact us </a>
          {' '}
          for any questions and update requests.
        </div>
        <div className="card restaurant-directions-container">
          <div className="card-header card-header-color pb-0">
            <i className="material-icons" title="directions">directions</i>
            <ul className="list-inline pull-right mb-0">
              <li className="list-inline-item">
                <label title="driving directions">
                  <input defaultChecked name="direction-type" onClick={this.travelModeSelected} type="radio" value="DRIVING" />
                  { ' ' }
                  <i className="icon-shift-driving material-icons">directions_car</i>
                </label>
              </li>
              <li className="list-inline-item">
                <label title="transit directions">
                  <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="TRANSIT" />
                  { ' ' }
                  <i className="icon-shift-transit material-icons">directions_transit</i>
                </label>
              </li>
              <li className="list-inline-item">
                <label title="walking directions">
                  <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="WALKING" />
                  { ' ' }
                  <i className="icon-shift-walking material-icons">directions_walk</i>
                </label>
              </li>
              <li className="list-inline-item" title="bicyling directions">
                <label>
                  <input name="direction-type" onClick={this.travelModeSelected} type="radio" value="BICYCLING" />
                  { ' ' }
                  <i className="icon-shift-bicycle material-icons">directions_bike</i>
                </label>
              </li>
            </ul>
          </div>
          <div className="restaurant-directions" ref="directions" />
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
