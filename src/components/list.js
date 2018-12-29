import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import conversion from '../services/conversion';
import './../styles/list.scss';
import 'font-awesome/css/font-awesome.min.css';
import GeoCoordinates from './../services/geoCoordinates';

export class List extends Component {
  constructor() {
    super();
    this.state = {
        'restaurants': []
    };

    this.initialize = this.initialize.bind(this);
    this.restaurantSelected = this.restaurantSelected.bind(this);
    this.restaurantTypeToggled = this.restaurantTypeToggled.bind(this);
    this.sort = this.sort.bind(this);  
    this.setupGeolocation = this.setupGeolocation.bind(this);
    this.setDistance = this.setDistance.bind(this);

    this.geoCordinates = new GeoCoordinates();

    PubSub.subscribe('restaurantListAvailable', this.initialize)
    PubSub.subscribe('pubsub-geolocation-available', this.setupGeolocation); 
  }

  initialize(message, restaurants) {
    if (message !== 'restaurantListAvailable') {
        console.warn('List update may be miswired');
    }

    // augment
    restaurants.map(restaurant => {
      restaurant.distance = null;
      restaurant.icon = conversion.iconInfo(restaurant.type);
      restaurant.show = true;

      return restaurant;
    });

    this.setState({'restaurants': restaurants});    
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

  setupGeolocation(message, position) {
    if (message !== 'pubsub-geolocation-available') {
      console.warn(`Unexpected subscription name. Provided: ${message}. Expected: pubsub-geolocation-available`);
    }
    console.log(`message: ${message}, Position: ${position}`);
    this.setDistance(position);
  }

  setDistance(position) {
    if (!position) {
      console.warn(`Provided with falsy position`);
      return;
    }

    let restaurants = this.state.restaurants;

    restaurants.map((restaurant, index) => {
      const distance = this.geoCordinates.getDistanceInMiles(
        restaurant.latitude, 
        restaurant.longitude,
        position.coords.latitude, 
        position.coords.longitude,
      );
      restaurant.distance = distance.toFixed(2);

      return restaurant;
    });
    
    this.setState({
      restaurants: restaurants,
    });
  }

  render() {
    const restaurants = this.state.restaurants.map((restaurant, index) => { 
        const colorClass = conversion.colorClass(restaurant.type);
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
            {restaurantDistanceDisplay && <span>({restaurant.distance} miles)</span>}
            {<i className={choiceAward}></i>}
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
                <span className={conversion.colorClass('vegetarian')}> 
                  Vegetarian ({conversion.code('vegetarian')}) 
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
                <span className={conversion.colorClass('vegan')}> 
                  Vegan ({conversion.code('vegan')}) 
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
            <span className={conversion.colorClass('raw vegan')}> 
              Raw Vegan ({conversion.code('raw vegan')}))
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
