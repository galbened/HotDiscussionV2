(function () {
    angular.module('graph.factory', [])
        .factory("discussionNetwork", [function () {
            return function(argumentsMap){
                return {
                    tree: "/api/discussions/" + "bla" + "/$"
                };
            };
        }]);
})();

