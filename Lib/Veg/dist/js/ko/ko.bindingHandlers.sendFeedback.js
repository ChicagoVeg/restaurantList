; (function (window, ko, $, _) {
    'use strict';

    ko.bindingHandlers.sendFeedback = {
        init: function (element) {
                $(element).on('click', function(e) {
                	var name = _.string.trim($('input[name="feebackName"]').val()),
                		email = _.string.trim($('input[name="feebackEmail"]').val()),
                		comment = _.string.trim($('input[name="feebackComment"]').val());

                	window.open('mailto:restaurants@chicagoveg.com?Subject=Feedback on Restaurant ApplicationFROM' + email + '&body=' + comment );

                	e.preventDefault();
                });
        }
    };
})(window, window.ko, window.jQuery, window._);