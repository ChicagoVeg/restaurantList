
import React, { Component } from 'react';
import { GoogleMap, Marker, withScriptjs, withGoogleMap } from 'react-google-maps';
import PropTypes from 'prop-types'

export class GoogleMaps extends Component {
  constructor(props) {
    super(props)
    this.latitude = Number.parseFloat(this.props.latitude) || 41.954418;
    this.longitude = Number.parseFloat(this.props.longitude) || -87.669250;
  }
   
  render() {
    return (
      <div>
        <GoogleMap
          defaultCenter={{ 
            lat: this.latitude, 
            lng: this.longitude }
          }
          defaultZoom={8}
          latitude="">
          {this.props.isMarkerShown && 
            <Marker position={{ 
              lat: this.latitude, 
              lng: this.longitute }
            } />
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
