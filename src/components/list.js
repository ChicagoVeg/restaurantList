import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import restaurantsUtils from '../utils/restaurants';
import './../styles/list.scss';
import 'font-awesome/css/font-awesome.min.css';

export class List extends Component {
  constructor() {
    super();
    this.state = {
        'restaurants': []
    };

    this.initialize = this.initialize.bind(this);
    this.addressAutoDetectToggled = this.addressAutoDetectToggled.bind(this);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.sort = this.sort.bind(this);  

    PubSub.subscribe('restaurantListAvailable', this.initialize)
    PubSub.subscribe('pubsub-address-auto-detect-toggled', this.addressAutoDetectToggled);
  }

  initialize(message, restaurants) {
    if (message !== 'restaurantListAvailable') {
        console.warn('List update may be miswired');
    }

    // augment
    restaurants.map(restaurant => {
      restaurant.distance = null;
      restaurant.icon = restaurantsUtils.iconInfo(restaurant.type);
      restaurant.show = true;

      return restaurant;
    });

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

  restaurantTypeToggled(e) {
    const isChecked = e.target.isChecked;
    const value = e.target.value;
    PubSub.publish('pubsub-restaurant-type-toggled', {
      'isChecked': isChecked, 
      'value': value,
    });
  }

  sort(e) {
    const key = e.target.name;
  
    if (key !== 'name' && key !== 'distance') {
      console.error(`Unknown sorting request. The request was to sort by: ${key}. Request cannot proceed`);
      return;
    }
 
    const restaurants = this.state.restaurants;
 
    this.setState({
      'restaurants': this.sortBy(key, restaurants)
    });
  
  }

  sortBy(key, restaurants) {
    restaurants.sort((a, b) => {
      const aKey = a[key];
      const bKey = b[key]; 

      if (aKey < bKey) { return -1; } 
      else if (aKey > bKey) { return 1;} 
      return 0;
    })
    return restaurants;
  }

  render() {
    const restaurants = this.state.restaurants.map((restaurant, index) => { 
        const colorClass = restaurantsUtils.colorClass(restaurant.type);
        const restaurantDistanceDisplay = !!restaurant.distance; 
        let choiceAward = '';
        
        if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'top') {
          choiceAward = 'fa fa-trophy fa-lg choice-award-top';
        } else if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'runnerup') {
          choiceAward = 'fa fa-trophy fa-lg choice-award-runner';
        } else if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'gold') {
          choiceAward = 'fa fa-star fa-lg choice-award-gold';
        } 

        return (<li className="list-group-item" key={index}> 
          <label>
            <input 
              onChange={this.restaurantSelected}
              name="restaurant-selected"  
              type="radio" 
              value={index}  
            /> 
            <span>{restaurant.name}</span>
            {' '}
            <span className={colorClass}>{restaurant.icon.code}</span>
            {' '}
            {restaurantDistanceDisplay && <span>({restaurant.distance})</span>}
            {<i class={choiceAward}></i>}
          </label>
        </li>)
    });

    return (
      <div>
        <div>
          <ul className="list-group">
            <li className="list-group-item">
              <label>  
                <input
                  checked
                  name="restaurantType" 
                  onChange={this.restaurantTypeToggled}  
                  type="checkbox" 
                  value="vegetarian" /> 
                <span className={restaurantsUtils.colorClass('vegetarian')}> 
                  Vegetarian ({restaurantsUtils.code('vegetarian')}) 
                </span>
              </label>
            </li>
            <li className="list-group-item">
              <label>
                <input 
                  checked
                  name="restaurantType"
                  onChange={this.restaurantTypeToggled}
                  type="checkbox" 
                  value="vegan" /> 
                <span className={restaurantsUtils.colorClass('vegan')}> 
                  Vegan ({restaurantsUtils.code('vegan')}) 
                </span>
            </label>
        </li>
        <li className="list-group-item">
          <label>
            <input 
              checked
              name="restaurantType"
              onChange={this.restaurantTypeToggled}
              type="checkbox" 
              value="raw-vegan" /> 
            <span className={restaurantsUtils.colorClass('raw vegan')}> 
              Raw Vegan ({restaurantsUtils.code('raw vegan')}))
              </span>
          </label>
        </li>
    </ul>
        </div>
        <div className="pull-right">
          <input 
            name="name"
            onClick={this.sort} 
            type="button" 
            value="Name" 
          /> 
          <span>|</span> 
          <input 
            name="distance" 
            onClick={this.sort}
            type="button" 
            value="Distance" 
          />
        </div>
        <ul className="list-group">
            {restaurants}
        </ul>
      </div>
    )
  }
}

export default List
