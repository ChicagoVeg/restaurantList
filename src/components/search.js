import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import NotificationSystem from 'react-notification-system';
import { GeoCoordinates } from '../services/geoCoordinates';
import topics from '../services/topics';

//TODO: (1) Move notification to App.js. It is a sys concern
export class Search extends Component {
  constructor(props) {
    super(props);

    this.geolocationUnsupportedSystem = React.createRef();
    this.searchBox = React.createRef();

    this.state = {
      autoDetect: true,
      details: {},
    };

    this.geoCoordinates = new GeoCoordinates();

    this.canGeolocate = this.canGeolocate.bind(this);
    this.geolocate = this.geolocate.bind(this);
    this.performSearch = this.performSearch.bind(this);
    this.resetSearchBox = this.resetSearchBox.bind(this);
    this.mapInitDetailsAvailable = this.mapInitDetailsAvailable.bind(this);

    PubSub.subscribe(topics.mapInitDetailsAvailable, this.mapInitDetailsAvailable);
  }

  canGeolocate() {
    return !!window.navigator.geolocation;
  }

  geolocate() {
    const geolocation = window.navigator.geolocation;

    geolocation.getCurrentPosition(
      (position) => {
        console.log(`Geolocation allowed with position: ${position}`);
        PubSub.publish(topics.infoNotification, 'Address automatically detected');
        PubSub.publish(topics.geolocationAvailable, position);
      },
      (error) => {
        console.warn(`Geolocation code: ${error.code}. Geolocation message: ${error.message}`);
        let message = '';

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
      },
    );
  }

  mapInitDetailsAvailable(message, details) {
    if (message !== topics.mapInitDetailsAvailable) {
      console.warn(`Unexpected map details. Expected: mapInitDetailsAvailable. Provided ${message}`);
    }

    this.setState({
      details,
    });
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

  resetSearchBox() {
    this.searchBox.value = '';
  }

  componentDidMount() {
    const canGeolocate = this.canGeolocate();

    this.setState({
      autoDetect: canGeolocate,
    });

    if (canGeolocate) {
      this.geolocate();
    } else {
      const warning = 'Geolocation is not supported by your browser';
      PubSub.publish(topics.warningNotification, warning);
    }
  }

  render() {
    return (
      <div>
        <div>
          <NotificationSystem ref={this.geolocationUnsupportedSystem} />
        </div>
        <div>
          <div className="input-group mb-4">
            <div className="input-group-prepend">
              <span
                    className="input-group-text"
                    id="basic-addon1"
                  >
                    {this.state.autoDetect && (
                      <div className="input-group-prepend">
                            <div className="auto-detect-region">
                              <button
                                    className="button-link"
                                    type="button"
                                    name="auto-detect-address"
                                    value="Auto Detect"
                                  >
                                    <i className="auto-detect-icon material-icons">location_on</i>
                                  </button>
                            </div>
                          </div>
                      )}
                  </span>
            </div>
            <input
              type="search"
              className="form-control js-address search-box"
              placeholder="Type address OR Auto-detect (button to left)"
              aria-label="search"
              required="required"
              aria-describedby="basic-addon1"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
