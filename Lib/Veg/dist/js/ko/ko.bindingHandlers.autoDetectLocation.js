; (function (ko, $, navigator) {
    'use strict';

    ko.bindingHandlers.autoDetectLocation = {
        update: function (element, valueAccessor) {
            var value = ko.unwrap(valueAccessor());

            $(element)[value ? 'show' : 'hide']();

        }
    };
})(window.ko, window.jQuery, window.navigator);