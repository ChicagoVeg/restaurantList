import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import { GeoCoordinates } from '../services/geoCoordinates';
import topics from '../services/topics';

//TODO: (1) Move notification to App.js. It is a sys concern
export class SearchArea extends Component {
  constructor(props) {
    super(props);

    this.searchBox = React.createRef();

    this.state = {
      autoDetected: false,
      details: {},
      canGeolocate: !!window.navigator.geolocation, 
      searchText: 'Type address OR Auto-detect (button to left)',
    };

    this.noGeolocationSearchtext = 'Type address';
    this.geoCoordinates = new GeoCoordinates();

    this.geolocate = this.geolocate.bind(this);
    this.performSearch = this.performSearch.bind(this);
    this.mapInitDetailsAvailable = this.mapInitDetailsAvailable.bind(this);
    this.gotAddressFromLatitudeAndLongitudeFromProvider = this.gotAddressFromLatitudeAndLongitudeFromProvider.bind(this);

    PubSub.subscribe(topics.mapInitDetailsAvailable, this.mapInitDetailsAvailable);
    PubSub.subscribe(topics.gotAddressFromLatitudeAndLongitude, this.gotAddressFromLatitudeAndLongitudeFromProvider);
  }

  geolocate() {
    // it seems you do not get the pop-up requesing geolocation right
    // when you use arrow functions
    navigator.geolocation.getCurrentPosition((function(position) {
      PubSub.publish(topics.infoNotification, 'Address automatically detected');
      position.isAutoDetected = true;
      this.setState({
        'autoDetected': true,
      });
      PubSub.publish(topics.geolocationAvailable, position);
      PubSub.publish(topics.needAddressfromLatitudeAndLongitude, position);
    }).bind(this), (function(error){
      console.warn(`Geolocation code: ${error.code}. Geolocation message: ${error.message}`);
      let message = '';
      this.setState({
        'canGeolocate': false,
        'searchText': this.noGeolocationSearchtext,
      });

      switch (error.code) {
        case 0:
          message = 'Position undetermined due to an unspecified error.';
          break;
        case 1:
          message = 'Permission denied.';
          break;
        case 2:
          message = 'Position cannot be determined by the system.';
          break;
        case 3:
          message = 'A timeout occurred while trying to determine position.';
          break;
        default:
          message = 'Cannot determine position.';
          console.error(`The code has a geolocation constant that it not to. There may be a hidden bug. The code is ${error.code}`);
      }
      const warning = `${message} Please, manually add address`;
      PubSub.publish(topics.warningNotification, warning);
    }).bind(this) );
  }

  mapInitDetailsAvailable(message, details) {
    if (message !== topics.mapInitDetailsAvailable) {
      console.warn(`Unexpected map details. Expected: mapInitDetailsAvailable. Provided ${message}`);
    }

    this.setState({
      details,
    });
  }

  gotAddressFromLatitudeAndLongitudeFromProvider(message, address) {
    if (message !== topics.gotAddressFromLatitudeAndLongitude) {
      console.warn(`Unexpected subscription received. Expected: ${topics.gotAddressFromLatitudeAndLongitude}. Received: ${message}`);
    }

    this.searchBox.current.value = address;
  }

  performSearch() {
    const { value } = this.searchBox;
    const searchText = value
      ? value.trim()
      : '';

    if (!searchText) {
      return;
    }
  
    const done = (addressDetails) => {
      const { location } = addressDetails.results[0].geometry;
      const geoCoordinates = {
        coords: {
          latitude: location.lat,
          longitude: location.lng,
        },
        formatted_address: addressDetails.results[0].formatted_address,
      };
      PubSub.publish(topics.geolocationAvailable, geoCoordinates);
    };
    
    this.geoCoordinates.getGeocoordinatesFromAddress(
      searchText,
      this.state.details.map.key,
      done,
    );
  }

  componentDidMount() {
    if (this.state.canGeolocate) {
      this.geolocate();
    } else {
      const warning = 'Geolocation is not supported by your browser';
      this.setState({
        'searchText': this.noGeolocationSearchtext,
      });
      PubSub.publish(topics.warningNotification, warning);
    }
  }

  render() {
    return (
        <div className="search-area">
          <div className="input-group mb-4">
            <div className="input-group-prepend">
            { this.state.canGeolocate && <span
                    className="input-group-text"
                    id="basic-addon1"
                  >                  
                      <div className="input-group-prepend">
                            <div className="auto-detect-region" title="click to auto-detect address">
                              <button
                                    className="button-link"
                                    type="button"
                                    name="auto-detect-address"
                                    onClick={this.geolocate}
                                    value="Auto Detect"
                                  >
                                    <i className="auto-detect-icon material-icons text-black-50">
                                      my_location
                                    </i>
                                  </button>
                            </div>
                          </div>
                  </span>
              }
            </div>
            <input
              aria-describedby="basic-addon1"
              aria-label="search"
              className="form-control js-address search-box"
              placeholder={this.state.searchText}
              ref={this.searchBox}
              required="required"
              type="search"
            />
          </div>
        </div>
    );
  }
}

export default SearchArea;
