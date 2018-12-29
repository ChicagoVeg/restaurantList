import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import NotificationSystem from 'react-notification-system';
import './../styles/search.scss';
import { GeoCoordinates } from '../services/geoCoordinates';

export class Search extends Component { 
    constructor(props) {
        super(props);

        this.geolocationUnsupportedSystem = React.createRef();
        this.searchBox = React.createRef();

        this.state = {
            'autoDetect': true,
            'details': {}
        };

        this.geoCoordinates = new GeoCoordinates();

        this.showNotification = this.showNotification.bind(this);
        this.canGeolocate = this.canGeolocate.bind(this);
        this.geolocate = this.geolocate.bind(this);
        this.performSearch = this.performSearch.bind(this);
        this.resetSearchBox = this.resetSearchBox.bind(this);
        this.keyPress = this.keyPress.bind(this);
        this.mapInitDetailsAvailable = this.mapInitDetailsAvailable.bind(this);

        PubSub.subscribe('mapInitDetailsAvailable', this.mapInitDetailsAvailable);
    } 
    
    showNotification(options) {
        const notification = this.geolocationUnsupportedSystem.current;
        notification.addNotification(options);
      }

    canGeolocate() {
        return !!window.navigator.geolocation;
    }

    geolocate() {
        const geolocation = window.navigator.geolocation;

        geolocation.getCurrentPosition(
            (function(position) {
                console.log(`Geolocation allowed with position: ${position}`);
                this.showNotification({
                    'autoDismiss': 2,
                    'level': 'info',
                    'message': 'Address automatically detected',
                    'position': 'tc',
                });
                PubSub.publish('pubsub-geolocation-available', position);  
            }).bind(this), 
            (function(error) {
                console.warn(`Geolocation code: ${error.code}. Geolocation message: ${error.message}`);
                let message = '';

                switch(error.code) {
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
                this.showNotification({
                    'autoDismiss': 6,
                    'level': 'warning',
                    'message': `${message} Please, manually add address`,
                    'position': 'tc',
                });
            }).bind(this));
    }

    mapInitDetailsAvailable(message, details) {
        if (message !== 'mapInitDetailsAvailable') {
            console.warn(`Unexpected map details. Expected: mapInitDetailsAvailable. Provided ${message}`);
        }

        this.setState({
            'details': details,
        });
    }

    performSearch() {
        const value = this.searchBox.value;
        const searchText = value ?
            value.trim() :
            ''

        if (!searchText) {
            return;
        }
        console.log('begin search');

        const done = (addressDetails) => {
            console.log('address info');
            const location = addressDetails.results[0].geometry.location;
            const geoCoordinates = {
                'coords': {
                    'latitude':  location.lat,
                    'longitude': location.lng,
                }
            }
            PubSub.publish('pubsub-geolocation-available', geoCoordinates);
        };

        this.geoCoordinates.getGeocoordinatesFromAddress(
            searchText, 
            this.state.details.map.key,
            done
        );
    }

    resetSearchBox() {
       this.searchBox.value = '';
    }

    keyPress(e) {
        const key = e.key;
        
        if (key === 'Enter') {
            this.performSearch()
        }
    }
    componentDidMount() {
        const canGeolocate = this.canGeolocate();

        this.setState({ 
            'autoDetect':  canGeolocate
        });

        if (canGeolocate) {
            this.geolocate();
        } else {
            console.log('Geolocation is not supported by the browser');
            this.showNotification(
                {
                    'autoDismiss': 6,
                    'level': 'warning',
                    'message': 'Geolocation is not supported by your browser',
                    'position': 'tc',
                }
            );
        }
    }

    render() {
        return (
            <div>
                <NotificationSystem ref={this.geolocationUnsupportedSystem} />
                <div className="input-group mb-3">
                    {this.state.autoDetect && <div className="input-group-prepend">
                        <div className="input-group-text">
                            <input type="button" 
                                name="auto-detect-address"
                                value="Auto Detect"
                            />
                        </div>
                    </div>}
                    {/* search icon and box */}
                    <svg xmlns="http://www.w3.org/2000/svg" style={{display:'none'}}>
                        <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-search-14" viewBox="0 0 40 40">
                            <path d="M26.51 28.573c-2.803 2.34-6.412 3.748-10.35 3.748C7.236 32.32 0 25.087 0 16.16 0 7.236 7.235 0 16.16 0c8.926 0 16.16 7.235 16.16 16.16 0 4.213-1.61 8.048-4.25 10.925L40 39.015l-1.524 1.524L26.51 28.572zm-10.35 2.132c8.033 0 14.545-6.512 14.545-14.544S24.193 1.617 16.16 1.617 1.617 8.128 1.617 16.16c0 8.033 6.512 14.545 14.545 14.545z"
                                fill-rule="evenodd" />
                        </symbol>
                        <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-clear-5" viewBox="0 0 20 20">
                         <path d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm1.35-10.123l3.567 3.568-1.225 1.226-3.57-3.568-3.567 3.57-1.226-1.227 3.568-3.568-3.57-3.57 1.227-1.224 3.568 3.568 3.57-3.567 1.224 1.225-3.568 3.57zM10 18.272c4.568 0 8.272-3.704 8.272-8.272S14.568 1.728 10 1.728 1.728 5.432 1.728 10 5.432 18.272 10 18.272z"
                            fill-rule="evenodd" />
                        </symbol>
                    </svg>
                    <div 
                        className="searchbox sbx-custom"
                        novalidate="novalidate" 
                        onClick={this.performSearch}
                        onKeyPress={this.keyPress}
                        onsubmit="return false;" 
                    >
                        <div role="search" className="sbx-custom__wrapper">
                            <input 
                                autocomplete="off" 
                                className="sbx-custom__input"
                                name="search"
                                placeholder="Add an address"
                                ref={el => this.searchBox = el}
                                required="required" 
                                type="search"
                            />
                            <button 
                                className="sbx-custom__submit"
                                title="Submit your search query." 
                                type="button" 
                            >
                                {/*See- https://stackoverflow.com/a/27326082/178550 */}
                                <svg 
                                    dangerouslySetInnerHTML={{__html:'<use xlink:href="#sbx-icon-search-14"></use>'}}
                                    onClick={() =>{
                                        this.geolocate();
                                    }}
                                    role="img" aria-label="Search" 
                                >                                  
                                </svg>
                            </button>
                            <button 
                                className="sbx-custom__reset"
                                onClick={this.resetSearchBox}
                                type="button" 
                                title="Clear the search query."
                            >
                                <svg role="img" aria-label="Reset"  dangerouslySetInnerHTML={{__html:'<use xlink:href="#sbx-icon-clear-5"></use>'}}>
                                </svg>
                            </button>    
                        </div>
                    </div>






                </div>    
            </div>
        );
    }
}

export default Search;
