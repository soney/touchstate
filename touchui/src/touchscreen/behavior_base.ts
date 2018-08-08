/* tslint:disable */
(function(root) {
    var behaviors = {};
    root.registerBehavior = function(name, implementation, func) {
        if (!behaviors[implementation]) {
            behaviors[implementation] = {};
        }
        behaviors[implementation][name] = func;
    };
    root.getBehavior = function(name, implementation) {
        if (behaviors[implementation]) {
            return behaviors[implementation][name];
        } else {
            return undefined;
        }
    };
}(this));
