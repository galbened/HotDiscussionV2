angular.module('discussionChat', ['ngAnimate'])

    .directive('chat', function () {

        var chatController = function($scope){

            $scope.expandedChat = false;
            $scope.chatData = {};
            $scope.chatData.messageBody = null;

            $scope.tabClass = "fa fa-comments";

            function scrollChatToButtom(){
                setTimeout(function(){
                    var chatBox = document.getElementById('chatBox');
                    chatBox.scrollTop = chatBox.scrollHeight;
                },0)
            }

            $scope.socket.on('sending-chat-message',function(chatMsg){
                $scope.chatMessages.push(chatMsg);

                if(!$scope.expandedChat) $scope.tabClass = "fa fa-comments redFlashingIcon";
                else scrollChatToButtom();
            });

            $scope.chatExpansionFlip = function(){
                $scope.expandedChat = !$scope.expandedChat;

                if($scope.expandedChat){
                    scrollChatToButtom();
                    $scope.tabClass = "fa fa-comments";
                }
            };

            $scope.sendChatMessage = function(keyEvent) {
                if (keyEvent.which === 13 && $scope.chatData.messageBody != null){

                    var message = {name:$scope.fullname,
                                   role:$scope.role,
                                   body:$scope.chatData.messageBody};

                    $scope.socket.emit('new-chat-message',message);

                    $scope.chatData.messageBody = null;
                }
            }
        }

        return{
            restrict: "E",
            controller: chatController,
            controllerAs: 'chatCtl',
            bindToController: true,
            templateUrl: "../partials/chat.html"
        }
    })