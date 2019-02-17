import { Component } from 'react';

export class MapProviderBase extends Component {
  constructor(props) {
    super(props);
  }

  restaurantSelected(message, restaurant) {}

  setDirectionsOnMap() {}

  loadFullMap(message, mapDetail) {}

  directionUpdate(message, direction) {}

}

export default MapProviderBase;
