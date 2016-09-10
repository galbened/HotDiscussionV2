angular.module('discussionChat', ['ngAnimate'])

    .directive('chat', function () {

        var chatController = function($scope){

            $scope.expandedChat = false;
            $scope.chatData = {};
            $scope.chatData.messageBody = null;

            $scope.tabClass = "fa fa-comments btn-lg btn-primary";

            function scrollChatToButtom(){
                setTimeout(function(){
                    var chatBox = document.getElementById('chatBox');
                    chatBox.scrollTop = chatBox.scrollHeight;
                },0)
            }

            $scope.socket.on('sending-chat-message',function(chatMsg){
                $scope.chatMessages.push(chatMsg);
                scrollChatToButtom();

                if(!$scope.expandedChat) $scope.tabClass = "fa fa-comments rediconcolor btn-lg btn-primary";
            });

            $scope.chatExpansionFlip = function(){
                $scope.expandedChat = !$scope.expandedChat;

                if($scope.expandedChat){
                    scrollChatToButtom();
                    $scope.tabClass = "fa fa-comments btn-lg btn-primary";
                }
            };

            $scope.sendChatMessage = function(keyEvent) {
                if (keyEvent.which === 13){

                    //if($scope.role.substring(0,5) == 'admin')

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