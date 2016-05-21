(function () {
  angular.module('tree.factory', [])
  .factory("URLConfig", [function () {
    return function(discId){
      return {
        tree: "/api/discussions/" + discId + "/$"
      };
    };
  }]);
})();

