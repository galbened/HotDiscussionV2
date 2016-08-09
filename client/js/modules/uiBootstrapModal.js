angular.module('bootstrapModalApp', ['ngAnimate', 'ui.bootstrap']);
angular.module('bootstrapModalApp').controller('ModalCtrl', function ($scope, $uibModal, $log) {

    $scope.animationsEnabled = true;

    var socket;

    $scope.$on('discussion-socketIO', function (e,discussionSocket) {
        socket = discussionSocket;
    });

    $scope.$emit('request socket');

    setTimeout(function(){$scope.open = function () {

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/userInfoInput.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                items: function () {
                    return $scope.items;
                },
                socket: function () {
                    return socket;
                }
            }
        })
    };
    },300);
/* could be useful
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });


    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
*/

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('bootstrapModalApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items ,socket) {

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