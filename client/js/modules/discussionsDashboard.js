(function() {
  'use strict';
  angular
    .module('discussionsDashboardApp', [])
    .controller('iscussionsDashboardCtrl', ['$scope','$http','$window', function($scope, $http, $window){
      $scope.pressAdd = false;

      $scope.discussions = [];

      //initiate the fields of the table
      $http({
        method: 'GET',
        url: '/api/discussions'
      }).then(function(res){
        $scope.discussions = res.data;
      }, function(err){
        console.log(err.statusText);
      });  

      $scope.goToDisc = function(idx){
      	var id = $scope.discussions[idx]._id;
      	var title = $scope.discussions[idx].title;
      	var description = $scope.discussions[idx].description;

      	$window.location.href = '/discussions/' + id + '/' + title + '/' +description;
      };
    }]);
})();
