angular.module('bootstrapModalApp', ['ngAnimate', 'ui.bootstrap']);
angular.module('bootstrapModalApp').controller('ModalCtrl', function ($scope, $uibModal, $log) {

    $scope.animationsEnabled = true;

    var socket = $scope.socket;

    $scope.open = function () {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/userInfoInput.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                socket: function () {
                    return socket;
                }
            }
        })
    };

    $scope.openPM = function (index) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/pmInput.html',
            controller: 'pmModalCtrl',
            size: 'sm',
            resolve: {
                socket: function () {
                    return socket;
                },
                group_id: function (){
                    return $scope.users_groups[index]._id;
                }
            }
        })
    };

    $scope.enterContent = function (index) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/enterDiscContent.html',
            controller: 'enterContentCtrl',
            size: 'lg',
            resolve: {
                socket: function () {
                    return socket;
                },
                discID: function (){
                    return $scope.discussions[index]._id;
                }
            }
        })
    };

    $scope.presentDiscussionNetworkGraph = function () {

        var argsMap = $scope.getArgsMap();

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/discussionNetwork.html',
            controller: 'discussionNetworkGraphCtrl',
            size: 'lg',
            resolve: {
                argsMap: function (){
                    return argsMap;
                }
            }
        })
    };

    $scope.presentUserNetworkGraph = function (users) {

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/userNetwork.html',
            controller: 'userNetworkGraphCtrl',
            size: 'lg',
            resolve: {
                socket: function (){
                    return socket;
                },
                users: function(){
                    return users;
                }
            }
        })
    };

    $scope.copyConfirmationModal = function (index) {
        $uibModal.open({
            animation: false,
            templateUrl: '../partials/copyConfirmationModal.html',
            controller: 'copyConfirmationModalCtrl',
            size: 'sm',
            resolve: {
                discID: function (){
                    return $scope.discussions[index]._id;
                },
                copyDiscussionFunc: function (){
                    return $scope.copyDiscussion;
                }
            }
        })
    };

    socket.on('sending-pm',function(data){

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/pmShow.html',
            controller: 'pmShowModalCtrl',
            size: 'sm',
            resolve: {
                socket: function () {
                    return socket;
                },
                body: function (){
                    return data.body;
                }
            }
        })
    });
});

angular.module('bootstrapModalApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance ,socket) {

    $scope.userInfo = "";

    socket.on('sending-user-info',function(data){
        $scope.userInfo = data.userInfo;
    });

    socket.emit('requesting-user-info');

    $scope.ok = function () {
        socket.emit('updating-user-info', {userInfo:$scope.userInfo})
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('pmModalCtrl', function ($scope, $uibModalInstance ,socket, group_id) {

    $scope.ok = function () {
        socket.emit('new-pm', {group_id:group_id,body:$scope.pmText});
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('pmShowModalCtrl', function ($scope, $uibModalInstance ,socket, body) {

    $scope.body = body;

    $scope.ok = function () {
        $uibModalInstance.close();
    };
});

angular.module('bootstrapModalApp').controller('copyConfirmationModalCtrl', function ($scope, $uibModalInstance, discID, copyDiscussionFunc) {

    $scope.ok = function () {
        copyDiscussionFunc(discID);
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('enterContentCtrl', function ($scope, $uibModalInstance ,socket, discID) {

    socket.on('sending-discussion-content',function(data){
        $scope.content = data.content;
        if(data.content != null)
            $("#saveContentButton").attr('disabled',true);
    });

    socket.emit('requesting-discussion-content', {disc_id:discID});

    $scope.ok = function () {
        socket.emit('update-discussion-content', {content:$scope.content, disc_id:discID});
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp')
    .controller('discussionNetworkGraphCtrl',
        ['networkGraphFactory','$scope','$uibModalInstance','argsMap', function (networkGraphFactory, $scope, $uibModalInstance, argsMap) {

    var data = networkGraphFactory.getDiscussionNetworkJSON(argsMap);

    $scope.options = data.options;

    $scope.data = {
        "nodes": data.nodes,
        "edges": data.edges
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };
}]);

angular.module('bootstrapModalApp')
    .controller('userNetworkGraphCtrl',
        ['networkGraphFactory','$scope','$uibModalInstance','socket', 'users', function (networkGraphFactory, $scope, $uibModalInstance, socket, users) {

            $scope.users = users;
            var user_id = "";

            socket.on('sending-arguments-involving-user',function(args){
                var argsMap = {};
                var count = 0;

                if(args.length==0){
                    $scope.showGraph = false;
                }
                else{
                    args.forEach(function(arg){
                        argsMap[arg._id] = arg;
                        count++;
                        if(count==args.length){
                            var json = networkGraphFactory.getUserNetworkJSON(argsMap,user_id);
                            $scope.options = json.options;
                            $scope.data = {
                                "nodes": json.nodes,
                                "edges": json.edges
                            };
                            $scope.showGraph = true;
                        }
                    });
                }
            });

            $scope.getNewUserGraph = function(user){
                user_id = user._id;
                socket.emit('requesting-arguments-involving-user',{user_id:user_id});
            };

            $scope.ok = function () {
                $uibModalInstance.close();
            };
    }]);