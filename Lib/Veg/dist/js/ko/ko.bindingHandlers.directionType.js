; (function (ko, $) {
    'use strict';

    ko.bindingHandlers.directionType = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            $(element).on('click', { ko: ko,  element: element, valueAccessor: valueAccessor, allBindings: allBindings, viewModel: viewModel, bindingContext: bindingContext }, function (e) {
                var data = e.data,
                    koBindingContextRoot = data.bindingContext.$root,
                    directionElement;

                // no restaurant checked, do nothing
                if ($('[name="restaurantList"]:checked').length === 0) {
                    return;
                }

                directionElement = $('.v-directions')[0];
                data.ko.bindingHandlers.directions.update(directionElement, data.valueAccessor, data.allBindings, data.viewModel, data.bindingContext);
            });
        }
    };
})( window.ko, window.jQuery);