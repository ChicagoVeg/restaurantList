import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import conversion from '../services/conversion';
import './../styles/main.scss';
import 'font-awesome/css/font-awesome.min.css';
import GeoCoordinates from './../services/geoCoordinates';
import topics from '../services/topics';
import 'material-design-icons/iconfont/material-icons.css';


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
    this.toogleDirection = this.toogleDirection.bind(this);
    this.travelModeSelected = this.travelModeSelected.bind(this);

    this.geoCordinates = new GeoCoordinates();

    PubSub.subscribe(topics.restaurantListAvailable, this.initialize)
    PubSub.subscribe(topics.geolocationAvailable, this.setupGeolocation); 
  }

  initialize(message, restaurants) {
    if (message !== topics.restaurantListAvailable) {
        console.warn('List update may be miswired');
    }

    // augment
    restaurants.map(restaurant => {
      restaurant.distance = null;
      restaurant.icon = conversion.getIconDetails(restaurant.type);
      restaurant.visible = true;

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
    PubSub.publish(topics.restaurantSelected, restaurants[index]); 
    PubSub.publish(topics.directionRefUpdated, `js-direction-${index}`);
  }

  restaurantTypeToggled(e) {
    const restaurantType = {
      'checked': e.target.checked,
      'name': e.target.value,
    };
    PubSub.publish(topics.restaurantTypeToggle, restaurantType);
    this.filterRestaurants(restaurantType);
  }

  filterRestaurants(restaurantType) {
    let restaurants = this.state.restaurants
    
    restaurants.forEach(restaurant => {
      if (restaurant.type.toLowerCase() === restaurantType.name) {
        restaurant.visible = restaurantType.checked;
      }
    });
    this.setState({
      'restaurants': restaurants
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
    if (message !== topics.geolocationAvailable) {
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

  toogleDirection(e) {
    const element = e.currentTarget;
    element.classList.toggle('active');
    let panel = element.nextElementSibling;
    const display = panel.style.display;
    panel.style.display = display === 'block' ? 'none': 'block';
  }

  travelModeSelected(e) {
    const travelMode = e.currentTarget.value;

    PubSub.publish(topics.travelModeSelected, travelMode);
  }

  render() {
    const restaurants = this.state.restaurants.map((restaurant, index) => { 
        const getColorClass = conversion.getColorClass(restaurant.type);
        const restaurantDistanceDisplay = !!restaurant.distance; 
        let choiceAward = '';
        
        if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'top') {
          choiceAward = 'fa fa-trophy fa-lg choice-award-top';
        } else if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'runnerup') {
          choiceAward = 'fa fa-trophy fa-lg choice-award-runner';
        } else if (!!restaurant.bestInTownAward && restaurant.bestInTownAward.toLowerCase() === 'gold') {
          choiceAward = 'fa fa-star fa-lg choice-award-gold';
        } 

        return (restaurant.visible && <li 
            className="list-group-item list-item" 
            key={index}
          > 
          <div className="rounded-corner">
            <label>
              <input 
                onChange={this.restaurantSelected}
                name="restaurant-selected"  
                type="radio" 
                value={index}  
              /> 
              <span>{restaurant.name}</span>
              {' '}
              <span className={getColorClass}>{restaurant.icon.code}</span>
              {' '}
              {restaurantDistanceDisplay && <span>({restaurant.distance} miles)</span>}
              {<i className={choiceAward}></i>}
            </label>
            <div>
            <ul className="list-inline">
            <li className="list-inline-item">
              <label> 
                <input 
                  name="direction-type"
                  onClick={this.travelModeSelected} 
                  type="radio" 
                  value="DRIVING"
                /> <i class="material-icons">directions_car</i>
              </label>
            </li>
            <li className="list-inline-item">
              <label> 
                <input 
                  name="direction-type"
                  onClick={this.travelModeSelected} 
                  type="radio" 
                  value="TRANSITING"
                /> <i class="material-icons">directions_transit</i>
              </label>
            </li>
            <li className="list-inline-item">
             <label> 
               <input 
                 name="direction-type"
                 onClick={this.travelModeSelected} 
                 type="radio" 
                 value="WALKING"
               /> <i className="material-icons">directions_walk</i>
             </label>
            </li>
            <li className="list-inline-item">
              <label> 
                <input 
                  name="direction-type"
                  onClick={this.travelModeSelected}
                  type="radio" 
                  value="BICYCLING"
                /> <i class="material-icons">directions_bike</i>
              </label>
            </li>
          </ul>
              <button className="accordion" onClick={this.toogleDirection}>Direction</button>
              <div className="panel">
                <div className={`js-direction-${index}`}></div>
              </div>
            </div>
          </div>
        </li>)
    });

    return (
      <div>
        <div class="mx-auto restaurant-type">
          <ul className="list-inline">
            <li className="list-inline-item">
              <label>  
                <input
                  defaultChecked={true}
                  name="restaurantType" 
                  onChange={this.restaurantTypeToggled}  
                  type="checkbox" 
                  value="vegetarian" /> 
                <span className={conversion.getColorClass('vegetarian')}> 
                  Vegetarian ({conversion.code('vegetarian')}) 
                </span>
              </label>
            </li>
            <li className="list-inline-item">
              <label>
                <input 
                defaultChecked={true}
                  name="restaurantType"
                  onChange={this.restaurantTypeToggled}
                  type="checkbox" 
                  value="vegan" /> 
                <span className={conversion.getColorClass('vegan')}> 
                 Vegan ({conversion.code('vegan')}) 
                </span>
            </label>
        </li>
        <li className="list-inline-item">
          <label>
            <input 
              defaultChecked={true}
              name="restaurantType"
              onChange={this.restaurantTypeToggled}
              type="checkbox" 
              value="raw vegan" /> 
            <span className={conversion.getColorClass('raw vegan')}> 
            {' '} Raw Vegan ({conversion.code('raw vegan')})
              </span>
          </label>
        </li>
    </ul>
        </div>
        <div className="pull-right">
          <input 
            className="button-link"
            name="name"
            onClick={this.sort} 
            type="button" 
            value="Name" 
          /> 
          <span> | </span> 
          <input 
            className="button-link"
            name="distance" 
            onClick={this.sort}
            type="button" 
            value="Distance" 
          />
        </div>
        <br />
        <ul className="list-group">
            {restaurants}
        </ul>
      </div>
    )
  }
}

export default List
