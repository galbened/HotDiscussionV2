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
        //socket.emit('new-pm', {group_id:group_id,body:$scope.pmText});
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