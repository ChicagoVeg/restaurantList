import React, { Component } from 'react';
import { GoogleMap, Marker, withScriptjs, withGoogleMap, InfoWindow } from 'react-google-maps';
import PropTypes from 'prop-types'
import conversion from '../utils/conversion';

export class GoogleMaps extends Component {
  constructor(props) {
    super(props)
    this.latitude = Number.parseFloat(this.props.map.startingLatitude) || 41.954418;
    this.longitude = Number.parseFloat(this.props.startingLongitude) || -87.669250;

    this.setInfoWindow = this.setInfoWindow.bind(this);

    this.state = {
      'markers': this.props.markers,
      'map': this.props.map,
      
    };

    // augmentation to support mapping features
    this.state.markers.map(marker => {
      marker.showInfoWindow = false;
      return marker;
    });
  }

  setInfoWindow(flag, index){
    let markers = this.state.markers;

    markers[index].showInfoWindow = flag;
    this.setState({
      'markers': markers
    });
  }

  markerClicked(marker) {
    console.log('====================================')
    console.log('Maker clicked');
    marker.showInfoWindow = true;
    console.log('====================================')
  }

  render() {
    //const {markers, map} = this.props;

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
            this.state.markers.map((marker, index) => {
              const colorCode = conversion.colorCode(marker.type);
              const iconUrl= 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•|';
            
              return <Marker
                icon={`${iconUrl}${colorCode}`}
                key={index}
                onClick={() => this.markerClicked(index)}
                onMouseOver={() => this.setInfoWindow(true, index)}
                onMouseOut={() => this.setInfoWindow(false, index)}
                position={{
                  lat: Number.parseFloat(marker.latitude),
                  lng: Number.parseFloat(marker.longitude),
                }}
              >
              {
                marker.showInfoWindow && (<InfoWindow key={index}>
                  <h4>{marker.name}</h4>
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
  'containerElement': PropTypes.element,
  'googleMapURL': PropTypes.string,
  'loadingElement': PropTypes.element,
  'mapElement': PropTypes.element,
  'markers': PropTypes.array,
  'map': PropTypes.object,
}

export default withScriptjs(withGoogleMap(GoogleMaps))
