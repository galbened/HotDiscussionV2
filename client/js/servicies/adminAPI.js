(function(){
  angular
    .module('adminService', [])
    .config('adminApi', ['$http', function($http){
      return {
        save: function(newDisc, $scope){
          $http({
            method:'POST',
            url: '/api/discussions',
            data: newDisc
          }).then(function success(res){
            $scope.discussions.push(res.data);
          },function error(res){
            console.log(res.statusText);
          });
        },

        getAll: function($scope){
          $http({
            method: 'GET',
            url: '/api/discussions'
          }).then(function(res){
            $scope.discussions = res.data;
          }, function(err){
            console.log(err.statusText);
          });   
        },

        delete: function(id, $scope){
          $http({
            method: 'DELETE',
            url: '/api/discussions/' + $scope.discussions[idx]._id
          }).then(function(res){
            $scope.discussions.splice(idx, 1);
          });
        },

        edit: function(id, $scope){
          $http({
            method: 'PUT',
            url: '/api/discussions/' + $scope.discussions[idx]._id,
            data: edittedDisc
          }).then(function(res){
            $scope.discussions[idx] = res.data;
          },function error(res){
            console.log(res.statusText);
          });
        }

      };
    }]);
  })();

      