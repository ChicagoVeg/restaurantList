; (function (ko) {
    'use strict';

    ko.bindingHandlers.invisible = {
        update: function (element, valueAccessor, allBindings, vm, bindingContext) {
            var value = ko.unwrap(valueAccessor()),
                invisibleFunc = function() { return !value(); };

            ko.bindingHandlers.visible.update(element, invisibleFunc, allBindings, vm, bindingContext)
        }
    };
})(window.ko);
