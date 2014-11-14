; (function (ko, $) {
    'use strict';

    ko.bindingHandlers.selectRestaurant = {
        init: function (element, valueAccessor, allBindings, vm, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
                data = bindingContext.$data;
            
            $(element).on('change', { value: value, data: data }, function (e) {
                e.data.value(data);
                $('.v-noRestaurantSelected').hide();
            });
        }
    };
})(window.ko, window.jQuery);