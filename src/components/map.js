import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import GoogleMaps from './googleMaps';
import pubSub from '../services/pubSub';

export class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'map': {
        'startingLatitude': 41.954420, 
        'startingLongitude': -87.669250,
      },
      'restaurants': [],
      'markers': [],
      'mapIsReady': false,
    };

    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    this.addressUpdated = this.addressUpdated.bind(this);
    
    PubSub.subscribe(pubSub.autoDetectionRequested, this.addressAutoDetectToggled);
    PubSub.subscribe(pubSub.restaurantSelected, this.restaurantSelected);
    PubSub.subscribe(pubSub.restaurantTypeToggle, this.restaurantTypeToggled)
    PubSub.subscribe(pubSub.mapInitDetailsAvailable, this.loadFullMap)
    PubSub.subscribe(pubSub.geolocationAvailable, this.addressUpdated);
  }

  // TODO: find out who puublishes this
  addressAutoDetectToggled(message, isChecked){
    if (message !== pubSub.autoDetectionRequested) {
      console.warn(`You may have miswired a pub/sub in list. The event is: ${message}`);
    }
    console.log(`Address auto detect recognized by search.js with value: ${isChecked}`);
  }

  restaurantSelected(message, restaurant) {
    if (message !== pubSub.restaurantSelected) {
      console.warn(`Map received an unexpected subscription in restaurant selection. It is: ${message}`);
    }
    console.log(`New restaurant selected: ${restaurant}`);
    PubSub.publish(pubSub.ThirdPartyProviderReceiveSelectedRestaurant, restaurant);
  } 

  restaurantTypeToggled(message, type) {
    if (message !== pubSub.restaurantTypeToggle) {
      console.warn(`Restaurant type recieved in unexpected subscription broadcast. The broadcast is: ${message}.`);
    }
    console.log(`sortBy: ${type}`);
  }

  addressUpdated(message, position) {
    if (message !== pubSub.geolocationAvailable) {
      console.warn(`Unexpected subscription received. Expected: ${pubSub.geolocationAvailable}. Received: ${message}`);
    }
    PubSub.publish(pubSub.ThirdPartyProviderUserAddressUpdated, position);
  }

  loadFullMap(message, mapDetails){
    if (message !== pubSub.mapInitDetailsAvailable) {
      console.warn(`Unexpected subscription. Expected: mapInitDetailsAvailable. Provided: ${message}`);
    }

    // Markers contain same field as restaurants but can contains user-info, 
    // So it was cloned into a new array
    let markers = mapDetails.restaurants.map(r => ({...r}));
    const userMaker = {
      'id': 'userMaker',
      'name': 'You are here',
      'latitude': mapDetails.map.startingLatitude,
      'longitude': mapDetails.map.startingLongitude,
      'type': 'user',
    };

    markers.push(userMaker);
    this.setState({
      'markers': markers,
      'map': mapDetails.map,
      'mapIsReady': true,
    });

    mapDetails.markers = markers; // augment
    PubSub.publish(pubSub.ThirdPartyProviderMapInitDetailsAvailable, mapDetails)
  }

  render() {
    return (
      // Separating Maps and GoogleMaps compnents makes it easier to
      // replace Google Maps if the need arises
      //See: https://github.com/tomchentw/tomchentw.github.io/blob/master/src/Pages/Demos/ReactGoogleMaps.jsx
      <div>
        <GoogleMaps 
          containerElement={<div style={{ height: `400px` }}></div>}
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          isMarkerShown
          loadingElement={<div style={{ height: `100%` }}></div>}
          mapElement={<div style={{ height: `100%` }}></div> }
          markers={this.state.markers}
          map={this.state.map}
          zoom={3}
        >
        </GoogleMaps>         
      </div>
    )
  }
}

export default Map
