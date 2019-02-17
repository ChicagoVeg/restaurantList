import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import GoogleMaps from './googleMaps';
import topics from '../services/topics';

export class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      map: {
        startingLatitude: 41.954420,
        startingLongitude: -87.669250,
      },
      restaurants: [],
      markers: [],
    };
    this.isAutoDetected = false;

    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    this.addressUpdated = this.addressUpdated.bind(this);
    this.travelModeSelected = this.travelModeSelected.bind(this);
    this.directionsUpdated = this.directionsUpdated.bind(this);
    this.getAddressFromLatAndLng = this.getAddressFromLatAndLng.bind(this);
    this.obtainedAddressFromLatAndLng = this.obtainedAddressFromLatAndLng.bind(this);

    PubSub.subscribe(topics.autoDetectionRequested, this.addressAutoDetectToggled);
    PubSub.subscribe(topics.restaurantSelected, this.restaurantSelected);
    PubSub.subscribe(topics.mapInitDetailsAvailable, this.loadFullMap);
    PubSub.subscribe(topics.geolocationAvailable, this.addressUpdated);
    PubSub.subscribe(topics.travelModeSelected, this.travelModeSelected);
    PubSub.subscribe(topics.needAddressfromLatitudeAndLongitude, this.getAddressFromLatAndLng);
  }

  // TODO: find out who puublishes this
  addressAutoDetectToggled(message, isChecked) {
    if (message !== topics.autoDetectionRequested) {
      console.warn(`You may have miswired a pub/sub in list. The event is: ${message}`);
    }
    console.log(`Address auto detect recognized by search.js with value: ${isChecked}`);
  }

  restaurantSelected(message, restaurant) {
    if (message !== topics.restaurantSelected) {
      console.warn(`Map received an unexpected subscription in restaurant selection. It is: ${message}`);
    }
    console.log(`New restaurant selected: ${restaurant}`);
    PubSub.publish(topics.ThirdPartyProviderReceiveSelectedRestaurant, restaurant);
  }

  addressUpdated(message, position) {
    if (message !== topics.geolocationAvailable) {
      console.warn(`Unexpected subscription received. Expected: ${topics.geolocationAvailable}. Received: ${message}`);
    }
    this.isAutoDetected = position.isAutoDetected;
    PubSub.publish(topics.ThirdPartyProviderUserAddressUpdated, position);
  }

  directionsUpdated() {
    PubSub.publish(topics.directionsUpdated, null);
  }

  getAddressFromLatAndLng(message, position) {
    if (message !== topics.needAddressfromLatitudeAndLongitude) {
      console.warn(`Unexpected subscription received. Expected: ${topics.needAddressfromLatitudeAndLongitude}. Received: ${message}`);
    }
    
    PubSub.publish(topics.ThirdParyProviderNeedAddressfromLatitudeAndLongitude, position);
  }

  obtainedAddressFromLatAndLng(addressComponent) {
    PubSub.publish(topics.gotAddressFromLatitudeAndLongitude, addressComponent.formatted_address);
  }

  loadFullMap(message, mapDetails) {
    if (message !== topics.mapInitDetailsAvailable) {
      console.warn(`Unexpected topics. Expected: mapInitDetailsAvailable. Provided: ${message}`);
    }

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
    PubSub.publish(topics.ThirdPartyProviderMapInitDetailsAvailable, mapDetails);
  }

  travelModeSelected(message, travelMode) {
    if (message !== topics.travelModeSelected) {
      console.warn(`Unexpected topics. Provided: ${message}. Expected: ${topics.travelModeSelected}`);
    }

    PubSub.publish(topics.ThirdPartyProviderUpdateTravelMode, travelMode);
  }

  render() {
    return (
      // Separating Maps and GoogleMaps compnents makes it easier to
      // replace Google Maps if the need arises
      // See: https://github.com/tomchentw/tomchentw.github.io/blob/master/src/Pages/Demos/ReactGoogleMaps.jsx
      <div>
        <GoogleMaps
          containerElement={<div style={{ height: '400px' }} />}
          directionsUpdated={this.directionsUpdated}
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          isMarkerShown
          loadingElement={<div style={{ height: '100%' }} />}
          obtainedAddressFromLatAndLng={this.obtainedAddressFromLatAndLng}
          mapElement={<div style={{ height: '100%' }} />}
          markers={this.state.markers}
          map={this.state.map}
          noAddress={this.noAddress}
          zoom={3}
        />
      </div>
    );
  }
}

export default Map;
