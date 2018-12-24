import React, { Component } from 'react'
import PubSub from 'pubsub-js';

export class List extends Component {
  constructor() {
    super();
    this.state = {
        'restaurants': []
    };
    this.update = this.update.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    PubSub.subscribe('pubsub-update-restaurants-list', this.update)
    PubSub.subscribe('pubsub-address-auto-detect-toggled', this.addressAutoDetectToggled);
  }

  update(message, restaurants) {
    if (message !== 'pubsub-update-restaurants-list') {
        console.warn('List update may be miswired');
    }

    this.setState({'restaurants': restaurants});
  }

  addressAutoDetectToggled(message, isChecked){
    if (message !== 'pubsub-address-auto-detect-toggled') {
      console.warn(`You may have miswired a pub/sub in list. The event is: ${message}`);
    }

    console.log(`Address auto detect recognized by list.js with value: ${isChecked}`);
  }

  restaurantSelected(e) {
    const index = Number.parseInt(e.target.value);
    
    if (isNaN(index)) {
      console.warn(`Invalid index provided. The value is: ${index}`);
      return;
    }    
    const restaurants = this.state.restaurants;

    if (!restaurants || restaurants.length < index-1) {
      console.warn(`Invalid index passed to restarantSelection. The index is: ${index}`);  
    }
    PubSub.publish('pubsub-restaurant-selected', restaurants[index]); 
  }

  render() {
    const restaurants = this.state.restaurants.map((restaurant, index) => 
        <li className="list-group-item" key={index}> 
          <label>
            <input 
              onChange={this.restaurantSelected}
              name="restaurant-selected"  
              type="radio" 
              value={index}  
            /> 
            {restaurant.name}
          </label>
        </li>
    );

    return (
      <div>
        <ul className="list-group">
            {restaurants}
        </ul>
      </div>
    )
  }
}

export default List
