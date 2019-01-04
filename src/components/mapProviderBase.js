import { Component } from 'react';

export class MapProviderBase extends Component {
  constructor(props) {
    super(props);
  }

  restaurantSelected(message, restaurant) {}

  updateUserAddress(message, position) {}

  setDirectionsOnMap() {}

  loadFullMap(message, mapDetail) {}

  directionUpdate(message, direction) {}

  directionRefUpdated(message, direction) {}
}

export default MapProviderBase;
