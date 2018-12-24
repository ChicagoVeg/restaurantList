import React, { Component } from 'react'
import PubSub from 'pubsub-js';

export class Map extends Component {
  constructor(props) {
    super(props);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    PubSub.subscribe('pubsub-address-auto-detect-toggled', this.addressAutoDetectToggled);
    PubSub.subscribe('pubsub-restaurant-selected', this.restaurantSelected)
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

  render() {
    return (
      <div>
        Map        
      </div>
    )
  }
}

export default Map
