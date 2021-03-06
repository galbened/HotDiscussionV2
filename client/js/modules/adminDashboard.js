(function() {
  'use strict';
  angular
    .module('adminDashboardApp', ['btford.socket-io', 'socketio.factory','bootstrapModalApp','angularjs-dropdown-multiselect','ngVis','graph.factory'])
    .controller('adminDashboardCtrl', ['$scope','$http', '$window', 'socketio', function($scope, $http, $window, socketio){

      $scope.pressAdd = false;
      $scope.discussions = [];

      //disconnect from socket when exiting the web page
      var socket = socketio.discussions();

      $scope.socket = socket;


      socket.on('send-all-logged-users', function(data){
          var usersForAlert = "";
          data.loggedUsers.forEach(function(loggedUser){
              usersForAlert = usersForAlert + '\n' + loggedUser;
          });
          alert(usersForAlert);
      });

        socket.emit('check-unread-messages');

        $scope.showLoggedUsers = function(){
            socket.emit('request-all-logged-users');
        };

      //$scope.$on('request socket', function(){
      //    $scope.$broadcast('discussion-socketIO', socket);
      //});

      $(window).on('beforeunload', function(){
        socket.disconnect();
      });

      socket.on('new-discussion', function(newDiscussion){
         newDiscussion.args_count = 0;
         $scope.discussions.unshift(newDiscussion);
      });

        socket.on('sending-users-groups', function(data){
            $scope.users_groups = data.users_groups;
        });

        socket.on('copied-discussion', function(data){
            var newDiscussion = data.newDisc;
            newDiscussion.args_count = data.args_count;
            $scope.discussions.unshift(newDiscussion);
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

        $scope.copyDiscussion = function(id){
            //var id = $scope.discussions[idx]._id;
            socket.emit('copy-discussion',{disc_id:id});
        };

      //initiate the fields of the table

      $scope.lookupUser = {};
      $scope.tempForMod = "";
      $scope.tempForPermitted = "";
      $scope.lookupUsers_group = {};

      $http({
        method: 'GET',
        url: '/api/discussions'
      }).then(function(res){
        $scope.discussions = res.data.discs.reverse();

        // gettings for discussion initialization
        $scope.users = res.data.users;
        for (var i = 0, len = $scope.users.length; i < len; i++) {
            $scope.users[i].fullname = $scope.users[i].local.firstname + " " + $scope.users[i].local.lastname;
            $scope.lookupUser[$scope.users[i]._id] = $scope.users[i];
        }
        // getting user groups for discussion initialization
          $scope.users_groups = res.data.groups;
          for (var i = 0, len = $scope.users_groups.length; i < len; i++) {
              $scope.lookupUsers_group[$scope.users_groups[i]._id] = $scope.users_groups[i];
          }
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

      $scope.finishAdding = function(newDesc, newTitle, newUser, newPermittedPoster, newUserGroup){

          var newDisc = {};

          newDisc.title = newTitle;
          newDisc.description = newDesc;
          newDisc.restriction = "student";
          if (newUser){
              newDisc.moderator_id = newUser._id;
              newDisc.moderator_fname = newUser.local.firstname;
              newDisc.moderator_lname = newUser.local.lastname;
          }
          else{
              newDisc.moderator_id = undefined;
              newDisc.moderator_fname = undefined;
              newDisc.moderator_lname = undefined;
          }
          if(newPermittedPoster){
              newDisc.permittedPoster_id = newPermittedPoster._id;
              newDisc.permittedPoster_fname = newPermittedPoster.local.firstname;
              newDisc.permittedPoster_lname = newPermittedPoster.local.lastname;
          }
          else{
              newDisc.permittedPoster_id = undefined;
              newDisc.permittedPoster_fname = undefined;
              newDisc.permittedPoster_lname = undefined;
          }
          if(newUserGroup){
              newDisc.users_group_id = newUserGroup._id;
          }
          else{
              newDisc.users_group_id = undefined;
          }

        $http({
          method:'POST',
          url: '/api/discussions',
          data: newDisc
        })
        .success(function(newDiscussion){
          //$scope.discussions.push(newDiscussion);
          socket.emit('new-discussion', newDiscussion);
        })
        .error(function(err, status){
          console.log(err.statusText);
        });

        $scope.pressAdd = false;
        $scope.newDesc = "";
        $scope.newTitle = "";

      };

      //EDITING
      $scope.showEdit = function(discussion){
          discussion.edit = true;
      };

      $scope.cancelEdit = function(discussion){
          discussion.edit = false;
      };

      $scope.finishEdit = function(idx, edittedDesc, edittedTitle, edittedUser, edittedPermittedPoster,edittedUsersGroup){
        var oldDisc = $scope.discussions[idx];

        var tempDiscArgsCount = oldDisc.args_count;

        var edittedDisc = oldDisc;

        delete edittedDisc.args_count;

        if (edittedTitle)
            edittedDisc.title = edittedTitle;
        if (edittedDesc)
            edittedDisc.description = edittedDesc;
        if (edittedUser){
            edittedDisc.moderator_id = edittedUser._id;
            edittedDisc.moderator_fname = edittedUser.local.firstname;
            edittedDisc.moderator_lname = edittedUser.local.lastname;
        }
        else{
            edittedDisc.moderator_id = undefined;
            edittedDisc.moderator_fname = undefined;
            edittedDisc.moderator_lname = undefined;
        }
        if(edittedPermittedPoster){
            edittedDisc.permittedPoster_id = edittedPermittedPoster._id;
            edittedDisc.permittedPoster_fname = edittedPermittedPoster.local.firstname;
            edittedDisc.permittedPoster_lname = edittedPermittedPoster.local.lastname;
        }
        else{
            edittedDisc.permittedPoster_id = undefined;
            edittedDisc.permittedPoster_fname = undefined;
            edittedDisc.permittedPoster_lname = undefined;
        }

          if(edittedUsersGroup){
              edittedDisc.users_group_id = edittedUsersGroup._id;
          }
          else{
              edittedDisc.users_group_id = undefined;
          }

        $http({
          method: 'PUT',
          url: '/api/discussions/' + $scope.discussions[idx]._id,
          data: edittedDisc
        }).then(function(res){
          $scope.discussions[idx] = res.data;
          $scope.discussions[idx].args_count = tempDiscArgsCount;
          socket.emit('edit-discussion', res.data);
        },function error(res){
          console.log(res.statusText);
        });

        $scope.discussions[idx].edit = false;
      };

      $scope.updateDiscStatus = function(idx, newStatus){
        var oldDisc = $scope.discussions[idx];
        var edittedDisc = oldDisc;
        edittedDisc.status = newStatus;

        $http({
          method: 'PUT',
          url: '/api/discussions/' + $scope.discussions[idx]._id,
          data: edittedDisc
        }).then(function(res){
          $scope.discussions[idx] = res.data;
          socket.emit('edit-discussion', res.data);
        },function error(res){
          console.log(res.statusText);
        });
      };




      // ------------------------------------ Groups ----------------------------------------

        $scope.tempForGroup = "";

        //socket.emit('request-users-groups');

        $scope.addGroup = function(){
            $scope.pressAddGroups = true;
        };

        $scope.flipAddingGroup = function(){
            $scope.pressAddGroups = !$scope.pressAddGroups;
        };

        $scope.initEditGroup = function(index){
            $scope.users_groups[index].curUsers = [];
            $scope.users_groups[index].users.forEach(function(curUser){
                $scope.users.forEach(function(user){
                    if(curUser == user._id){
                        $scope.users_groups[index].curUsers.push(user);
                    }
                })
            });
        };

        $scope.flipGroupEdit = function(index){
            $scope.users_groups[index].edit = !$scope.users_groups[index].edit;
        }

        $scope.newGroupUsers = [];

        $scope.dropdownMultiselectSettings = {displayProp: 'fullname', idProp: '_id', externalIdProp: '_id'};

        $scope.doneAddingGroup = function(name,usersIDs){
            var users_group = {users_group: {name:name,users:usersIDs}};
            socket.emit('create-users-group',users_group);
            $scope.flipAddingGroup();
            setTimeout(function(){socket.emit('request-users-groups');},0);
        };

        $scope.doneEditGroup = function(index,name,usersIDs){
            var group_id = $scope.users_groups[index]._id;
            var users_group = {users_group: {_id:group_id,name:name,users:usersIDs}};
            socket.emit('update-users-group',users_group);
            $scope.flipGroupEdit(index);
            setTimeout(function(){socket.emit('request-users-groups');},0);
        };
    }]);
})();
