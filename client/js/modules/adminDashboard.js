(function() {
  'use strict';
  angular
    .module('adminDashboardApp', ['btford.socket-io', 'socketio.factory'])
    .controller('adminDashboardCtrl', ['$scope','$http', '$window', 'socketio', function($scope, $http, $window, socketio){
      var findDiscIdx = function(disc){
        for (var i = 0; i < $scope.discussions.length; i++){
          if ($scope.discussions[i]._id === disc._id){
            return i;
          }
        }
        return -1;
      };

      $scope.pressAdd = false;
      $scope.discussions = [];
/***
 *                     _   _   _                
 *                    | | | | (_)               
 *      _ __ ___  __ _| | | |_ _ _ __ ___   ___ 
 *     | '__/ _ \/ _` | | | __| | '_ ` _ \ / _ \
 *     | | |  __| (_| | | | |_| | | | | | |  __/
 *     |_|  \___|\__,_|_|  \__|_|_| |_| |_|\___|
 *                                              
 *                                              
 */
      var socket = socketio.discussions();
      $(window).on('beforeunload', function(){
        socket.disconnect();
      });

      socket.on('new-discussion', function(newDiscussion){
        $scope.discussions.push(newDiscussion);
      });

      socket.on('delete-discussion', function(disc){
        var idx = findDiscIdx(disc);
        if (idx >= 0)
          $scope.discussions.splice(idx, 1);
        else{
          console.log('error in deleting a discussion');
        }
      });

      socket.on('edit-discussion', function(disc){
        var idx = findDiscIdx(disc);
        if (idx > 0)
          $scope.discussions[idx] = disc;
        else{
          console.log('error in editing a discussion');
        }
      });

/***
 *                      _             _                            _              
 *                     | |           | |                          (_)             
 *       ___ ___  _ __ | |_ _ __ ___ | |______ ___  ___ _ ____   ___  ___ ___ ___ 
 *      / __/ _ \| '_ \| __| '__/ _ \| |______/ __|/ _ | '__\ \ / | |/ __/ _ / __|
 *     | (_| (_) | | | | |_| | | (_) | |      \__ |  __| |   \ V /| | (_|  __\__ \
 *      \___\___/|_| |_|\__|_|  \___/|_|      |___/\___|_|    \_/ |_|\___\___|___/
 *                                                                                
 *                                                                                
 */
      $scope.goToDisc = function(idx){
        var id = $scope.discussions[idx]._id;
        var title = $scope.discussions[idx].title;
        var description = $scope.discussions[idx].description;

        $window.location.href = '/discussions/' + id + '/' + title + '/' +description;
      };

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
            description: newDesc,
            isActive: true
        };

        $http({
          method:'POST',
          url: '/api/discussions',
          data: newDisc
        });
        $scope.pressAdd = false;
        $scope.newDesc = "";
        $scope.newTitle = "";
        
      };

      //DELETING
      $scope.delete = function(idx){
        // $scope.discussions.splice(idx, 1);
        $http({
          method: 'DELETE',
          url: '/api/discussions/' + $scope.discussions[idx]._id,
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
