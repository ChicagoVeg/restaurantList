import React, { Component } from 'react'
import PubSub from 'pubsub-js';
import NotificationSystem from 'react-notification-system';

export class Search extends Component { 
    constructor(props) {
        super(props);

        this.geolocationUnsupportedSystem = React.createRef();

        this.state = {
            'autoDetect': true,
        };

        this.autoDetectRequested = this.autoDetectRequested.bind(this);
        this.showNotification = this.showNotification.bind(this);
    } 
    
    autoDetectRequested(e) {
        this.geoLocate();
        //const isChecked = e.target.checked;
        //PubSub.publish('pubsub-address-auto-detect-toggled', isChecked)
    }

    showNotification(options) {
        const notification = this.geolocationUnsupportedSystem.current;
        notification.addNotification(options);
      }

    geoLocate() {
        const geolocation = window.navigator.geolocation;

        if (!window.navigator.geolocation) {
            console.log('Geolocation is not supported by the browser');
            this.showNotification(
                {
                    'autoDismiss': 6,
                    'level': 'warning',
                    'message': 'Geolocation is not supported by your browser',
                    'position': 'tc',
                }
            );
            this.setState({ 
                'autoDetect':  false
            });
    
            return;
        }

        geolocation.getCurrentPosition(
            (function(position) {
                console.log(`Geolocation allowed with position: ${position}`);
                this.showNotification({
                    'autoDismiss': 2,
                    'level': 'info',
                    'message': 'Address automatically detected',
                    'position': 'tc',
                });
                PubSub.publish('pubsub-geolocation-obtained', position);  
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

    componentDidMount() {
        this.geoLocate();
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
                                onClick={this.autoDetectRequested}
                                value="Auto Detect"
                            />
                        </div>
                    </div>}
                    <input
                        aria-label="Main search box" 
                        autoFocus 
                        className="form-control"
                        name="main-search"
                        placeholder="Search by address"
                        type="search"
                        />
                </div>    
            </div>
        );
    }
}

export default Search;
