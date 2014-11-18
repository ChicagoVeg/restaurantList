// Data calls

; (function (ko, $, veg, _) {
    'use strict';

    veg.restaurantFinderDataAccess = {
        _getUrl: function () {
            return $('[data-restaurants-url]').data('restaurants-url');
        },        
        
        get: function (before, success, error, complete) {
            $.ajax({
                url: this._getUrl(),
                dataType: 'json',
                type: 'GET',
                before: before || _.emptyFunction,
                success: success || _.emptyFunction,
                error: error || _.emptyFunction,
                complete: complete || _.emptyFunction
            });
        }
    };
})(window.ko, window.jQuery, window.veg, window._);