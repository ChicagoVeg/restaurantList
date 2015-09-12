; (function (ko, $) {
    'use strict';

    ko.bindingHandlers.preventDefault = {
        init: function (element) {
                $(element).on('click', function(e) {
                	e.preventDefault();
                });
        }
    };
})(window.ko, window.jQuery);