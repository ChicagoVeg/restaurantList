
import React, { Component } from 'react';
import { GoogleMap, Marker, withScriptjs, withGoogleMap } from 'react-google-maps';

export class GoogleMaps extends Component {
  render() {
    return (
      <div>
        <GoogleMap
          defaultZoom={8}
          defaultCenter={{ lat: -34.397, lng: 150.644 }}
        >
          {this.props.isMarkerShown && 
            <Marker position={{ lat: -34.397, lng: 150.644 }} />
          }
        </GoogleMap>
      </div>
    )
  }
}

export default withScriptjs(withGoogleMap(GoogleMaps))
