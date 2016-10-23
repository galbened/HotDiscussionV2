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

angular.module('bootstrapModalApp').controller('discussionNetworkGraphCtrl', function ($scope, $uibModalInstance, argsMap) {

    var users = {};
    var argByUser = {};
    var userToUserCount = {};

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            var name = argsMap[key].fname + " " + argsMap[key].lname;
            name = name.substr(0,8);
            users[argsMap[key].user_id] = {"user_id":argsMap[key].user_id, "name":name, "color":argsMap[key].color};
            argByUser[argsMap[key]._id] = argsMap[key].user_id;

        }
    }

    var nodes = [];
    var edges = [];

    for(var key in users){
        if (users.hasOwnProperty(key)) {
            var nodeJson = {"id":users[key].user_id,"label": users[key].name,"color":users[key].color,"shape":"circle","shadow":true,
                             "scaling": {"label":{"enabled": true}},"shadow":true};
            nodes.push(nodeJson);
        }
    }

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            if(argsMap[key].parent_id){
                var userFrom = argsMap[key].user_id;
                var userTo  = argByUser[argsMap[key].parent_id];
                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]=0;
            }
        }
    }

    var argsMapFiltered = {};

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            if(argsMap[key].parent_id){
                var userFrom = argsMap[key].user_id;
                var userTo  = argByUser[argsMap[key].parent_id];
                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]++;
                if(userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]==1){
                    argsMapFiltered[key] = {user_id:argsMap[key].user_id,parent_id:argsMap[key].parent_id};
                }
            }
        }
    }

    for(var key in argsMapFiltered){
        if (argsMapFiltered.hasOwnProperty(key)) {
            if(argsMapFiltered[key].parent_id){
                var userFrom = argsMapFiltered[key].user_id;
                var userTo  = argByUser[argsMapFiltered[key].parent_id];
                var count = userToUserCount[userFrom + userTo];
                var edge = {"from":userFrom,"to":userTo, arrows: { enabled: true, to: true }, "physics":true,
                            "label":count,"width":count/1.4, length: 350};
                edges.push(edge)
            }
        }
    }

    $scope.options = {
        autoResize: true,
        height: '800',
        width: '100%'
    };

    $scope.data = {
        "nodes": nodes,
        "edges": edges
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };
});