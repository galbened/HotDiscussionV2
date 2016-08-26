(function() {
    'use strict';
    angular
        .module('discussionsDashboardApp', ['btford.socket-io', 'socketio.factory','bootstrapModalApp'])
        .controller('discussionsDashboardCtrl', ['$scope','$http','$window','socketio', function($scope, $http, $window, socketio){

            // var findDiscIdx = function(disc){
            //   for (var i = 0; i < $scope.discussions.length; i++){
            //     if ($scope.discussions[i]._id === disc._id){
            //       return i;
            //     }
            //   }
            //   return -1;
            // };

            $scope.pressAdd = false;
            $scope.discussions = [];
            $scope.userRole = "";
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

            //$scope.$on('request socket', function(){
            //    $scope.$broadcast('discussion-socketIO', socket);
            //});

            $scope.socket = socket;

            $(window).on('beforeunload', function(){
                socket.disconnect();
            });

            socket.on('new-discussion', function(newDiscussion){
                $scope.discussions.unshift(newDiscussion);
            });

            socket.emit('check-unread-messages');

            // socket.on('delete-discussion', function(disc){
            //   var idx = findDiscIdx(disc);
            //   if (idx > 0)
            //     $scope.discussions.splice(idx, 1);
            //   else{
            //     console.log('error in deleting a discussion');
            //   }
            // });

            socket.on('edit-discussion', function(){
                $http({
                    method: 'GET',
                    url: '/api/discussions'
                }).then(function(res){
                    $scope.discussions = res.data.data.reverse();
                    // console.log($scope.discussions);
                    $scope.userRole = res.data.role;
                    // console.log($scope.userRole);
                }, function(err){
                    console.log(err.statusText);
                });
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
            //initiate the fields of the table
            $http({
                method: 'GET',
                url: '/api/discussions'
            }).then(function(res){
                $scope.discussions = res.data.data.reverse();
                // console.log($scope.discussions);
                $scope.userRole = res.data.role;
                // console.log($scope.userRole);
            }, function(err){
                console.log(err.statusText);
            });

            $scope.goToDisc = function(idx){
                var id = $scope.discussions[idx]._id;
                var title = $scope.discussions[idx].title;
                var description = $scope.discussions[idx].description;

                $window.location.href = '/discussions/' + id + '/' + title + '/' + description;
            };
        }]);
})();
