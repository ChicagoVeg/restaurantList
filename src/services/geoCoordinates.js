/**
 * Longitude/Latitude functionality
 *
 * @export
 * @class GeoCoordinates
 */
export class GeoCoordinates {
    convertDegreeToradian(degree) {
        return degree * (Math.PI/180);
    };
    
    getDistanceInMiles(lat1,lon1,lat2,lon2) {
        return this.getDistanceInKM(lat1,lon1,lat2,lon2) * 0.6213;
      };

    getDistanceInKM(lat1,lon1,lat2,lon2) {
        const R = 6371; // Radius of the earth in km
        
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            console.warn(`Invalid parameter(s). The provided values are: ${lon1}, ${lon2}, ${lat1}, ${lat2}`);
            return 0;
        }

        const dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        const dLon = this.deg2rad(lon2-lon1); 
        const a =  Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * 
            Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) *
            Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km

        return d;
      };
}

export default GeoCoordinates