import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import GoogleMaps from './googleMaps';
import pubSub from '../services/pubsub';

export class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'latitude': 41.954420, 
      'longitude': -87.669250,
      'map': 'http://maps.googleapis.com/maps/api/js?sensor=false',
      'restaurants': [],
      'markers': [],
    };

    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    
    PubSub.subscribe(pubSub.autoDetectionRequested, this.addressAutoDetectToggled);
    PubSub.subscribe(pubSub.restaurantSelected, this.restaurantSelected);
    PubSub.subscribe(pubSub.restaurantTypeToggle, this.restaurantTypeToggled)
    PubSub.subscribe(pubSub.mapInitDetailsAvailable, this.loadFullMap)
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
  } 

  restaurantTypeToggled(message, type) {
    if (message !== pubSub.restaurantTypeToggle) {
      console.warn(`Restaurant type recieved in unexpected subscription broadcast. The broadcast is: ${message}.`);
    }
    console.log(`sortBy: ${type}`);
  }

  loadFullMap(message, mapDetails){
    if (message !== pubSub.mapInitDetailsAvailable) {
      console.warn(`Unexpected subscription. Expected: mapInitDetailsAvailable. Provided: ${message}`);
    }

    // Markers contain same field as restaurants but can contains user-info, 
    // So it was cloned into a new array
    let marker = mapDetails.restaurants.map(r => ({...r}));
    const userMaker = {
      'id': 'userMaker',
      'name': 'You are here',
      'latitude': mapDetails.map.startingLatitude,
      'longitude': mapDetails.map.startingLongitude,
      'type': 'user',
    };

    marker.push(userMaker);
    this.setState({
      'markers': marker,
      'map': mapDetails.map,
    });
  }

  render() {
    return (
      // Separating Maps and GoogleMaps compnents makes it easier to
      // replace Google Maps if the need arises
      <div>
        <GoogleMaps 
          containerElement={<div style={{ height: `400px` }}></div>}
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          isMarkerShown
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          loadingElement={<div style={{ height: `100%` }}></div>}
          mapElement={<div style={{ height: `100%` }}></div> }
          markers={this.state.markers}
          map={this.state.map}
        >
        </GoogleMaps>         
      </div>
    )
  }
}

export default Map
