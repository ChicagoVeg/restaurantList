/**
 * Longitude/Latitude functionality
 *
 * @export
 * @class GeoCoordinates
 */
export class GeoCoordinates {
  convertDegreeToRadian(degree) {
    return degree * (Math.PI / 180);
  }

  getDistanceInMiles(latitude1, longtitude1, latitude2, longtitude2) {
    return this.getDistanceInKM(latitude1, longtitude1, latitude2, longtitude2) * 0.6213;
  }

  getDistanceInKM(latitude1, longtitude1, latitude2, longtitude2) {
    const R = 6371; // Radius of the earth in km

    if (!latitude1 || !longtitude1 || !latitude2 || !longtitude2) {
      console.warn(`Invalid parameter(s). The provided values are: ${longtitude1}, ${longtitude2}, ${latitude1}, ${latitude2}`);
      return 0;
    }

    const dLat = this.convertDegreeToRadian(latitude2 - latitude1);
    const dLon = this.convertDegreeToRadian(longtitude2 - longtitude1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(this.convertDegreeToRadian(latitude1))
            * Math.cos(this.convertDegreeToRadian(latitude2))
            * Math.sin(dLon / 2)
            * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    return d;
  }

  getGeocoordinatesFromAddress(address, key, done) {
    if (!address || !address.trim()) {
      console.error('Falsy address provided. Cannot continue');
      return;
    }

    if (!done) {
      console.error('There needs to be a callback function. The one provided is falsy. Cannot continue');
      return;
    }

    address = encodeURI(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}&sensor=false&libraries=places,marker`;
    fetch(url)
      .then((response) => response.json())
      .then((addressDetails) => {
        console.log('coordinates');
        done(addressDetails);
      })
      .catch((error) => {
        console.error(`Error getting latitude and longitude from address. The error is: ${error}`);
      });
  }
}

export default GeoCoordinates;
