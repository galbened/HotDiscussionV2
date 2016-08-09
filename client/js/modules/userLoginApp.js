(function(){
    'use strict';
    angular
        .module('userLiginApp', [])
        .controller('userLoginFormCtrl', ['$scope','$http', '$window','$timeout', function($scope, $http, $window,$timeout){
            
            $scope.dangerMessage = "";
            
            $scope.studentLogin = function(){
                // console.log('logging in as a student..');
                var data = {
                    username: $scope.username,
                    password: $scope.password,
                    role: "student"
                };
                $http({
                    method:'POST',
                    url: '/auth/login',
                    data: data
                })
                    .success(function(res){
                        //console.log(res)
                        if (res.message === 'logged-in'){
                            $window.location.href = '/discussions';
                        }
                        else{
                            $scope.dangerMessage = res.message;
                        }
                    })
                    .error(function(err, status){
                        console.log(err.statusText);
                    });
            }

            $scope.instructorLogin = function(){
                // console.log('logging in as an instructor..');
                var data = {
                    username: $scope.username,
                    password: $scope.password,
                    role: "instructor"
                };
                $http({
                    method:'POST',
                    url: '/auth/login',
                    data: data
                })
                    .success(function(res){
                        // console.log(res);
                        if (res.message === 'logged-in'){
                            $window.location.href = '/discussions';
                        }
                        else{
                            $scope.dangerMessage = res.message;
                        }
                    })
                    .error(function(err, status){
                        console.log(err.statusText);
                    });
            }
        }]);
})();