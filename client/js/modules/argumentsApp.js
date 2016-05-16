(function() {
  'use strict';
  angular
    .module('threadsApp', [], function($locationProvider){
      $locationProvider.html5Mode(true);
    })
    .controller('threadCtrl', ['$scope','$http', '$location', function($scope, $http, $location){

      var path = $location.path();
      var id = path.split('/')[1];
      debug = path;
      
    }]);
})();
