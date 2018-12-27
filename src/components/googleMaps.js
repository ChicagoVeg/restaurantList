
import React, { Component } from 'react';
import { GoogleMap, Marker, withScriptjs, withGoogleMap, InfoWindow } from 'react-google-maps';
import PropTypes from 'prop-types'
import restaurantsUtils from '../utils/restaurants';

export class GoogleMaps extends Component {
  constructor(props) {
    super(props)
    this.latitude = Number.parseFloat(this.props.latitude) || 41.954418;
    this.longitude = Number.parseFloat(this.props.longitude) || -87.669250;

    this.setInfoWindow = this.setInfoWindow.bind(this);

    this.state = {
      "restaurants": this.props.restaurants,
    };

    // augmentation to support mapping features
    this.state.restaurants.map(restaurant => {
      restaurant.showInfoWindow = false;
      return restaurant;
    });
  }

  setInfoWindow(flag, index){
    let restaurants = this.state.restaurants;

    restaurants[index].showInfoWindow = flag;
    this.setState({
      'restaurants': restaurants
    });
  }

  markerClicked(restaurant) {
    console.log('====================================')
    console.log('Maker clicked');
    restaurant.showInfoWindow = true;
    console.log('====================================')
  }

  render() {
    //const {restaurants, map} = this.props;

    return (
      <div>
        <GoogleMap
          defaultCenter={{ 
            lat: this.latitude, 
            lng: this.longitude }
          }
          defaultZoom={8}
          latitude="">
          
          {
            this.state.restaurants.map((restaurant, index) => {
              const colorCode = restaurantsUtils.colorCode(restaurant.type);
              const iconUrl= 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|';
            
              return <Marker
                icon={`${iconUrl}${colorCode}`}
                key={index}
                onClick={() => this.markerClicked(index)}
                onMouseOver={() => this.setInfoWindow(true, index)}
                onMouseOut={() => this.setInfoWindow(false, index)}
                position={{
                  lat: Number.parseFloat(restaurant.latitude),
                  lng: Number.parseFloat(restaurant.longitude),
                }}
              >
              {
                restaurant.showInfoWindow && (<InfoWindow key={index}>
                  <h4>{restaurant.name}</h4>
                </InfoWindow>)
              }              
              </Marker>
              })
          }

          </GoogleMap>
      </div>
    )
  }


}

GoogleMaps.propTypes = {
  'latitude': PropTypes.string,
  'longitude': PropTypes.string,
}

GoogleMaps.defaultProps = {
  'latitude': '41.954418',
  'longitude': '-87.669250',
}

export default withScriptjs(withGoogleMap(GoogleMaps))
