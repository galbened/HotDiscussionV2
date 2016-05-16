(function () {
    angular.module('tree.factory', [])
    .factory("URLConfig", [function () {
        return {
            tree: "api/data.json"
        };
    }]);
})();

//TODO: to change to a real server-API service...