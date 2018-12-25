import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import GoogleMaps from './googleMaps';

export class Map extends Component {
  constructor(props) {
    super(props);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    PubSub.subscribe('pubsub-address-auto-detect-toggled', this.addressAutoDetectToggled);
    PubSub.subscribe('pubsub-restaurant-selected', this.restaurantSelected);
    PubSub.subscribe('pubsub-restaurant-type-toggled', this.restaurantTypeToggled)
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

  render() {
    return (
      // Separating Maps and GoogleMaps compnents makes it easier to
      // replace Google Maps if the need arises
      <div>
        <GoogleMaps 
          isMarkerShown
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }}></div>}
          containerElement={<div style={{ height: `400px` }}></div>}
          mapElement={<div style={{ height: `100%` }}></div> }>
        </GoogleMaps>         
      </div>
    )
  }
}

export default Map
