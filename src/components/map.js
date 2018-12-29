import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import GoogleMaps from './googleMaps';

export class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'latitude': 41.954420, 
      'longitude': -87.669250,
      'map': 'http://maps.googleapis.com/maps/api/js?sensor=false',
      'restaurants': [],
    };

    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.loadFullMap = this.loadFullMap.bind(this);
    
    PubSub.subscribe('pubsub-address-auto-detect-toggled', this.addressAutoDetectToggled);
    PubSub.subscribe('pubsub-restaurant-selected', this.restaurantSelected);
    PubSub.subscribe('pubsub-restaurant-type-toggled', this.restaurantTypeToggled)
    PubSub.subscribe('mapInitDetailsAvailable', this.loadFullMap)
  }

  addressAutoDetectToggled(message, isChecked){
    if (message !== 'pubsub-address-auto-detect-toggled') {
      console.warn(`You may have miswired a pub/sub in list. The event is: ${message}`);
    }

    console.log(`Address auto detect recognized by search.js with value: ${isChecked}`);
  }

  restaurantSelected(message, restaurant) {
    if (message !== 'pubsub-restaurant-selected') {
      console.warn(`Map received an unexpected subscription in restaurant selection. It is: ${message}`);
    }
    console.log(`New restaurant selected: ${restaurant}`);
  } 

  restaurantTypeToggled(message, type) {
    if (message !== 'pubsub-restaurant-type-toggled') {
      console.warn(`Restaurant type recieved in unexpected subscription broadcast. The broadcast is: ${message}.`);
    }
    console.log(`sortBy: ${type}`);
  }

  loadFullMap(message, mapDetails){
    if (message !== 'mapInitDetailsAvailable') {
      console.warn(`Unexpected subscription. Expected: mapInitDetailsAvailable. Provided: ${message}`);
    }

    this.setState(mapDetails);
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
          restaurants={this.state.restaurants}
          map={this.state.map}
        >
        </GoogleMaps>         
      </div>
    )
  }
}

export default Map
