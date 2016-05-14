(function() {
  'use strict';
  angular
    .module('adminDiscApp', [])
    .controller('adminDiscCtrl', ['$scope','$http', function($scope, $http){
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

      //ADDING
      $scope.addDisc = function(){
          $scope.pressAdd = true;
      };

      $scope.cancelAdding = function(){
          $scope.pressAdd = false;
      };

      $scope.finishAdding = function(newDesc, newTitle){
        var newDisc = {
            title: newTitle,
            description: newDesc
        };

        $http({
          method:'POST',
          url: '/api/discussions',
          data: newDisc
        }).then(function success(res){
          $scope.discussions.push(res.data);
          $scope.pressAdd = false;
          $scope.newDesc = "";
          $scope.newTitle = "";
        },function error(res){
          console.log(res.statusText);
        });
        
      };

      //DELETING
      $scope.delete = function(idx){
        // $scope.discussions.splice(idx, 1);
        $http({
          method: 'DELETE',
          url: '/api/discussions/' + $scope.discussions[idx]._id
        }).then(function(res){
          $scope.discussions.splice(idx, 1);
        });
      };

      //EDITING
      $scope.showEdit = function(discussion){
          discussion.edit = true;
      };

      $scope.cancelEdit = function(discussion){
          discussion.edit = false;
      };

      $scope.finishEdit = function(idx, edittedDesc, edittedTitle){
        var oldDisc = $scope.discussions[idx];
        var edittedDisc = oldDisc;

        if (edittedTitle)
            edittedDisc.title = edittedTitle;
        if (edittedDesc)
            edittedDisc.description = edittedDesc;

        $http({
          method: 'PUT',
          url: '/api/discussions/' + $scope.discussions[idx]._id,
          data: edittedDisc
        }).then(function(res){
          $scope.discussions[idx] = res.data;
        },function error(res){
          console.log(res.statusText);
        });

        $scope.discussions[idx].edit = false;
      };
    }]);
})();
