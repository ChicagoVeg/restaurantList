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
    this.directionsUpdated = this.directionsUpdated.bind(this);
    this.formatTransactions = this.formatTransactions.bind(this);
    this.formatOpenHours = this.formatOpenHours.bind(this);
    this.convertNumberStringToDay = this.convertNumberStringToDay.bind(this);

    this.geoCordinates = new GeoCoordinates();
    this.selectedRestaurant = null;

    PubSub.subscribe(topics.restaurantListAvailable, this.initialize)
    PubSub.subscribe(topics.geolocationAvailable, this.setupGeolocation); 
    PubSub.subscribe(topics.directionsUpdated, this.directionsUpdated);
  }

  initialize(message, restaurantsData) {
    if (message !== topics.restaurantListAvailable) {
        console.warn('List update may be miswired');
    }

    // see: https://www.yelp.com/developers/documentation/v3/business
    const yelpData = restaurantsData.yelpData;

    // augment
    let restaurants = restaurantsData.restaurants
      .filter(restaurant => {
          return restaurant.closed !== 'true';
      })
      .map(restaurant => {
        restaurant.distance = null;
        restaurant.icon = conversion.getIconDetails(restaurant.type);
        restaurant.visible = true;
        restaurant.showDirection = false;
        restaurant.yelpData = yelpData[restaurant.yelpAlias] || {};

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
    this.selectedRestaurant = restaurants[index];
    PubSub.publish(topics.restaurantSelected, this.selectedRestaurant); 
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
    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  }

  travelModeSelected(e) {
    const travelMode = e.currentTarget.value;

    PubSub.publish(topics.travelModeSelected, travelMode);
  }

  directionsUpdated() {
    let restaurants = this.state.restaurants.map(restaurant => {
      restaurant.showDirection = restaurant.id === this.selectedRestaurant.id;
      
      return restaurant;
    }); 
      
    this.setState({
      'restaurants': restaurants
    });
 }

  formatTransactions(transactions) {
    if (!transactions) {
      return '';
    }

    transactions = transactions.sort()
    transactions = transactions.join(', ').replace('_', ' ');
    transactions = transactions.charAt(0).toUpperCase() + transactions.slice(1);  
    transactions = transactions.replace(/,\s*([a-z])/g, function(d,e) { return ", "+e.toUpperCase() });

    return transactions;
  }

  convertNumberStringToDay(day) {
    switch(day) {
      case 0: 
        day = 'Mon';
        break;
      case 1:
        day = 'Tue';
        break;
      case 2:
        day = 'Wed';
        break;
      case 3:
        day = 'Thu';
        break;
      case 4:
        day = 'Fri';
        break;
      case 5:
        day = 'Sat';
        break;
      case 6:
        day = 'Sun';
        break;
      default:
        day = '';
        console.warn(`Received an unexpected day. The value is: ${day}`);  
    }
    return day;
  }

  formatOpenHours(openHours) {
    if (!openHours || openHours.length === 0) {
      return;
    }

    let hours= [];

    openHours.forEach(h => {
      hours.push(this.convertNumberStringToDay(h.day));
      hours.push(': ')
      hours.push(h.start);
      hours.push(' - ');
      hours.push(h.end);
      hours.push(', ') 
    });

    return hours.join('').trimEnd(',');
  }

  render() {
    const restaurants = this.state.restaurants.map((restaurant, index) => { 
        const getColorClass = conversion.getColorClass(restaurant.type);
        const restaurantDistanceDisplay =  true; //!!restaurant.distance; 
        let choiceAward = '';
        const yelpData = restaurant.yelpData || {};
        const restaurant_image = yelpData ? restaurant.yelpData.image_url : "";
        const transactions = this.formatTransactions(yelpData.transactions);
        const openHours = this.formatOpenHours(Object.keys(yelpData).length === 0 ? '' : yelpData.hours[0].open);
        
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
          <div className="container rounded-corner">
            <div className="row">
              <div className="container">
                <div className="row">
                  <div className="col-md-7">
                    <label>
                    <input 
                      onChange={this.restaurantSelected}
                      name="restaurant-selected"  
                      type="radio" 
                      value={index}  
                    /> 
                    {' '}
                    <span className="restaurant-name">{restaurant.name}</span>
                    {'   '}
                    <span className={getColorClass}>{restaurant.icon.code}</span>
                    {' '}
                    {<i className={choiceAward}></i>}        
                    <span className="restaurant-phone">{restaurant.phone}</span>
                    <div>{restaurantDistanceDisplay && <span>({restaurant.distance} miles)</span>} away </div>
                    <div className="container-fluid">
                      <div className="row vertically-align-center">
                        <div className="col-md-4"><span className="font-weight-bold">Rating: </span> </div>
                        <div className="col-md-8"> {yelpData.rating}/5 ({yelpData.review_count} reviews) </div>
                        <br /><br />
                      </div>
                      <div className="row vertically-align-center">
                        <div className="col-md-4"><span className="font-weight-bold">Hours: </span></div>
                        <div className="col-md-8"> {openHours} </div>
                        <br / ><br />
                      </div>
                      <div className="row vertically-align-center">
                        <div className="col-md-4"><span className="font-weight-bold">Service Options:</span> </div>
                        <div className="col-md-8"><span className="">{transactions}</span> </div>
                        <br /><br />
                      </div>
                    </div>
                  </label>
                  </div>
                  <div className="col-md-5">
                    <img 
                      alt="restaurant" 
                      className="restaurant-image"
                      src={restaurant_image}height="280" 
                      width="200" />
                  </div> 
                </div>
              </div>
            </div>
            <div className="row">
              <div>
                <div style={{display: restaurant.showDirection ? 'block' : 'none' }}>                
                  <button className="accordion"  onClick={this.toogleDirection}>Direction</button>
                  <div className="panel">
                  <ul className="list-inline">
                  <li className="list-inline-item">
                 <label> 
                   <input 
                     name="direction-type"
                     onClick={this.travelModeSelected} 
                     type="radio" 
                     value="DRIVING"
                   /> <i className="icon-shift-driving material-icons">directions_car</i>
                 </label>
               </li>
                  <li className="list-inline-item">
                 <label> 
                   <input 
                     name="direction-type"
                     onClick={this.travelModeSelected} 
                     type="radio" 
                     value="TRANSITING"
                   /> <i className="icon-shift-transit material-icons">directions_transit</i>
                 </label>
               </li>
                  <li className="list-inline-item">
                <label> 
                  <input 
                    name="direction-type"
                    onClick={this.travelModeSelected} 
                    type="radio" 
                    value="WALKING"
                  /> <i className="icon-shift-walking material-icons">directions_walk</i>
                </label>
               </li>
                  <li className="list-inline-item">
                 <label> 
                   <input 
                     name="direction-type"
                     onClick={this.travelModeSelected}
                     type="radio" 
                     value="BICYCLING"
                   /> <i className="icon-shift-bicycle material-icons">directions_bike</i>
                 </label>
               </li>
                 </ul>
                    <div className={`js-direction-${index}`}></div>
                  </div>
                </div>  
            </div>
            </div>
          </div>
        </li>)
    });

    return (
      <div>
        <div className="mx-auto restaurant-type">
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
