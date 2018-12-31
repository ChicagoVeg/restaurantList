import React from 'react';
import PropTypes from 'prop-types'
import conversion from '../services/conversion';
import PubSub from 'pubsub-js';
import pubSub from '../services/pubSub';
import MapProviderBase from '../components/mapProviderBase';


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
    super(props)

    this.setInfoWindow = this.setInfoWindow.bind(this);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.updateUserAddress = this.updateUserAddress.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    this.setDirectionsOnMap = this.setDirectionsOnMap.bind(this); 

    PubSub.subscribe(pubSub.ThirdPartyProviderReceiveSelectedRestaurant, this.restaurantSelected);
    PubSub.subscribe(pubSub.ThirdPartyProviderUserAddressUpdated, this.updateUserAddress);
    PubSub.subscribe(pubSub.ThirdPartyProviderMapInitDetailsAvailable, this.loadFullMap)

    this.defaultLatitude = Number.parseFloat(this.props.map.startingLatitude) || 41.954418;
    this.defaultLongitude = Number.parseFloat(this.props.map.startingLongitude) || -87.669250;


    this.state = {
      'markers': this.props.markers,
      'map': this.props.map,
      'direction': {},
      'destination': '',
      'origin': '',
      'travelMode': 'TRANSIT',
      'googleMapsHasLoaded': false,
      'mapIsReady': false,
    };

    this.map = null; 
    this.markers = [];
    this.directionsService = null;
    this.directionsDisplay = null;
    this.destination = null; 
    this.origin = null;
    this.google = null;

    // augmentation to support mapping features
    this.state.markers.map(marker => {
      marker.showInfoWindow = false;
      return marker;
    });
  }

  setInfoWindow(flag, index){
    let markers = this.state.markers;

    markers[index].showInfoWindow = flag;
    this.setState({
      'markers': markers
    });
  }

  markerClicked(marker) {
    console.log('====================================')
    console.log('Maker clicked');
    marker.showInfoWindow = true;
    console.log('====================================')
  }

  restaurantSelected(message, restaurant) {
    if (message !== pubSub.ThirdPartyProviderReceiveSelectedRestaurant) {
      console.warn(`Received unexpected subscription. Expected: ${pubSub.ThirdPartyProviderReceiveSelectedRestaurant}. Received: ${message}`);
    }
    const address = restaurant.address;
    const formatted_address = `${address.address}, ${address.city}, ${address.state} ${address.zip}`
    this.destination= formatted_address;
    this.setDirectionsOnMap();
  }

  updateUserAddress(message, position) {
    if (message !== pubSub.ThirdPartyProviderUserAddressUpdated) {
      console.warn(`Unexpected subscription. Expected: ${pubSub.ThirdPartyProviderUserAddressUpdated}. Received: ${message}`);
    }

    this.origin = position.formatted_address;
    this.setDirectionsOnMap();
  }

  setDirectionsOnMap() {
    if (!this.origin || !this.destination) {
      console.error(`Both origin and destination must not be falsy. Origin is: ${this.origin}. Destination is: ${this.destination}`)
    }

    const request = {
      origin: this.origin,
      destination: this.destination,
      travelMode: 'DRIVING'
    };
    this.directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(result);
      } else {
        console.error(`Error loading direction service. The error is: ${status}`);
      }
    });
  }

  loadFullMap(message, mapDetails) {
    if (message !== pubSub.ThirdPartyProviderMapInitDetailsAvailable) {
      console.warn(`Unexpected subscription. Expected: ${pubSub.ThirdPartyProviderMapInitDetailsAvailable}. Received: ${message}`);
    }

    this.setState(mapDetails);
    this.setState({
      'mapIsReady': true,
    });
  }

  componentDidMount() {
    const ApiKey = 'AIzaSyBtKinaroy-zATTzX5ts17OuphpmXPAq1A';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}`;
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
    
    const { startingLatitude, startingLongitude, zoom, } = this.state.map;
    const google = window.google;
  
    this.map = new google.maps.Map(
      document.querySelector('#js-google-map-placeholder'), {
        center: {
          lat: Number.parseFloat(startingLatitude), 
          lng: Number.parseFloat(startingLongitude),
        },
        zoom: Number.parseFloat(zoom),
        mapTypeId: 'roadmap',
    });
    
    
    const LatLng = google.maps.LatLng;
    this.state.markers.forEach(marker => {
      const getIconDetails = conversion.getIconDetails(marker.type);
      const pin = `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|${getIconDetails.colorCode}`
      this.markers.push(new google.maps.Marker({
        'position': new LatLng({
          'lat': Number.parseFloat(marker.latitude), 
          'lng': Number.parseFloat(marker.longitude),
        }),
        'map': this.map, 
        'title': marker.name,
        'icon': pin,
      }));
    }); 

    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(this.map);


  }

  render() {
    return (
      <div id="js-google-map-placeholder"  style={{width: 600, height: 500}}>
      </div>
    )
  }
}

GoogleMaps.propTypes = {
  'containerElement': PropTypes.element,
  'googleMapURL': PropTypes.string,
  'loadingElement': PropTypes.element,
  'mapElement': PropTypes.element,
  'markers': PropTypes.array,
  'map': PropTypes.object,
}

export default GoogleMaps;
