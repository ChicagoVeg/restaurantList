; (function (window, ko) {
    'use strict';

    ko.bindingHandlers.socialMediaIconClick = {
        init: function (element, valueAccessor, allBindings, vm, bindingContext) {


            $(element).on('click', { valueAccessor: valueAccessor }, function (e) {
                var value = ko.unwrap(e.data.valueAccessor());

                //based on: http://blog.socialsourcecommons.org/2011/03/creating-share-this-on-facebooktwitter-links/
                 window.open(value.socialMedialurl + 'http://restaurants.chicagoveg.com' , 
                    '_blank', 
                    'toolbar=no,' +  
                    'scrollbars=yes,' + 
                    'resizable=yes,' + 
                    'top=' + value.top + ',' +
                    'left=' + value.left + ',' + 
                    'width=' + value.width + ',' +
                    'height=' + value.height);

            });
        }
    };
})(window, window.ko);
