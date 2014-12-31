/// host latitude-longitude calculation-methods. Based on: http://stackoverflow.com/a/27943/178550
;(function (veg, Math) {
  'use strict';

  veg.latitudeLongitude = function () {
      var self = {};

      self.getDistanceInKM = function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R, dLat, dLon, a, c, d;

        if (!lat1 || !lon1 || !lat2 || !lon2) {
          return 0;
        }

        R = 6371; // Radius of the earth in km
        dLat = self.deg2rad(lat2-lat1);  // deg2rad below
        dLon = self.deg2rad(lon2-lon1); 
        a =  Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(self.deg2rad(lat1)) * Math.cos(self.deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        d = R * c; // Distance in km

          return d;
      };

      self.getDistanceInMiles = function getDistanceInMiles(lat1,lon1,lat2,lon2) {
        return this.getDistanceInKM(lat1,lon1,lat2,lon2) * 0.6213;
      };

      self.deg2rad = function deg2rad(deg) {
          return deg * (Math.PI/180);
      };

      return self; 
  };  
})(window.veg, window.Math);