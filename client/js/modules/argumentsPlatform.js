(function(){
    angular.module('argumentsApp', ['tree.service','TreeWidget','btford.socket-io', 'socketio.factory','ngSanitize'], function($locationProvider){
        $locationProvider.html5Mode(true);
    })
        .controller('ArgumentsTreeController', ['TreeService','$scope', '$window', '$location','socketio', function (TreeService, $scope, $window, $location, socketio) {
            $scope.onlineUsers = [];

            var path = $location.path();
            var discId = path.split('/')[1];
            var socket = socketio.arguments({discussion: discId});

            var lastFivePosts = [];

            function fromReftoNestedJson(refJson){
                var refJsonMap = refJson.reduce(function(map, node) {
                    map[node._id] = node;
                    return map;
                }, {});
                var nestedJson = [];

                var maxDate = ' ';

                var nodesCopy = [];

                refJson.forEach(function(node) {

                    nodesCopy.push(node);

                    //expend all the nodes as default state...
                    if (node.expanded === undefined && node.sub_arguments !== undefined) {
                        node.expanded = true;
                    }

                    var parent = refJsonMap[node.parent_id];
                    if (parent) {
                        // create child array if it doesn't exist
                        (parent.sub_arguments || (parent.sub_arguments = []))
                        // add node to child array
                            .push(node);
                    } else {
                        // parent is 0 or missing
                        // nestedJson.push(node);
                        nestedJson.unshift(node);
                    }
                });

                //initiating last five comments array
                initLastFivePosts(nodesCopy);

                return nestedJson;

            }

            function updateLastFivePosts(newNode){
                //adds new created node to the last five, removing the oldest of the five
                lastFivePosts.unshift(newNode);
                newNode.lastPost = true;

                if(lastFivePosts.length>5)
                {
                    lastFivePosts[5].lastPost = false;
                    lastFivePosts.pop();
                }
            }

            function initLastFivePosts(nodesCopy){
                //sorting by all nodes by date created
                nodesCopy.sort(function(argA,argB){
                    if(argA.createdAt < argB.createdAt){
                        return 1;
                    }
                    if (argA.createdAt > argB.createdAt){
                        return -1;
                    }
                    else{
                        return 0;
                    }
                });

                //takes most recent 5 nodes or less than 5
                for(var index = 0;index<5 && index<nodesCopy.length;index++)
                {
                    nodesCopy[index].lastPost = true;
                    lastFivePosts.push(nodesCopy[index]);
                }
            }

            function sortArgumnets(argArray){
                argArray.sort(function(argA,argB){
                    if(argA.updatedAt < argB.updatedAt){
                        return 1;
                    }
                    if (argA.updatedAt > argB.updatedAt){
                        return -1;
                    }
                    else{
                        return 0;
                    }
                })
            }

            $scope.refreshDiscussion = function() {
                init();
            }

            //on page load...
            function init() {
                socket.on('connect', function(){
                    socket.emit('get-all-arguments');
                });
                socket.on('init-discussion', function(result){
                    console.log(result);
                    $scope.treeWithRef = result.discArguments;
                    $scope.treeNested = fromReftoNestedJson($scope.treeWithRef);
                    $scope.onlineUsers = result.onlineUsers;
                    // console.log($scope.treeNested);
                    // console.log('*******************************');
                    sortArgumnets($scope.treeNested);
                    // console.log($scope.treeNested);
                    // console.log('*******************************');
                    $scope.discussionTitle = result.discussion.title;
                    $scope.discussionDescription = result.discussion.description;
                    $scope.role = result.user.role;

                    // UPDATE #1 - retrieving discussion restriction and current session username into scope
                    $scope.discussionRestriction = result.discussion.restriction;
                    $scope.username = result.user.username;
                });
            }

            function getNodeById(tree, nodeId) {
                if (!tree) { return null; }
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i]._id == nodeId) {
                        return tree[i];
                    } else {
                        var child = getNodeById(tree[i].sub_arguments, nodeId);
                        if (child !== null) {
                            return child;
                        }
                    }
                }
                return null;
            }

            function contains(myArray, searchTerm, property) {
                for(var i = 0, len = myArray.length; i < len; i++) {
                    if (myArray[i][property] === searchTerm) return i;
                }
                return -1;
            }

            init();

            /**
             * function for sticking the "new argument" box at the top of the screen when scrolling the page
              */
            setTimeout(function doIt(){
              $(window).on("scroll", function(e){
                var screenTop = $(window).scrollTop();
                var anchorTop = $("#scroller-anchor").offset().top;
                var newArgumentTop=$("#scroller");
                var treeConversation = $("#treeConversation");
                if (screenTop>anchorTop) {
                  newArgumentTop.css({position:"fixed",top:"0px", "z-index":999});
                  treeConversation.css({"margin-top":"160px"});
                } else {
                  newArgumentTop.css({position:"relative"});
                  treeConversation.css({"margin-top":"0px"});
                }
              });

            }, 0);

            $(window).on('beforeunload', function(){
                socket.disconnect();
            });

            socket.on('submitted-new-argument', function(data){
                var newArgument = data.data;
                $scope.treeNested.unshift(newArgument);
                updateLastFivePosts(newArgument);
            });

            socket.on('submitted-new-reply', function(data){

                var newReply = data.data;
                var parentNode = getNodeById($scope.treeNested, newReply.parent_id);
                var mainThread = getNodeById($scope.treeNested, newReply.main_thread_id);
                var mainThreadInd = $scope.treeNested.indexOf(mainThread);

                // UPDATE #1 - condition added on 18/07 - only student discussions should see live updates from other users on top
                if($scope.discussionRestriction == "student") {
                    $scope.treeNested.splice(mainThreadInd, 1);
                    $scope.treeNested.unshift(mainThread);
                }
                //else
                //    $scope.newMessages = true;
                /*
                else TODO notifications for instructor discussion
                 */

                parentNode.sub_arguments.push(newReply);
                parentNode.expanded = true;

                updateLastFivePosts(newReply);
            });

            socket.on('edit-discussion', function(edittedDiscussion){
                if (edittedDiscussion.restriction === $scope.role || $scope.role === 'admin'){
                    $scope.discussionTitle = edittedDiscussion.title;
                    $scope.discussionDescription = edittedDiscussion.description;
                }
                else{
                    socket.emit('logout-user');
                }
            });

            socket.on('user-joined', function(newUser){
                var idx = contains($scope.onlineUsers, newUser.username, 'username');
                if (idx<0) $scope.onlineUsers.push(newUser);
            });

            socket.on('user-left', function(){
                socket.emit('update-online-users-list');
            });

            socket.on('new-online-users-list', function(newOnlineUsers){
                $scope.onlineUsers = newOnlineUsers;
            });

            socket.on('logout-redirect', function(redirect){
                $window.location.href = redirect;
            });

            /************************
             ************************************************/

            $scope.$on('submitted-new-reply', function (e, args) {
                var node = args.node;
                var replyText = args.replyText;
                // console.log('submiting new reply!');
                // console.log('by : ' + $scope.role);
                TreeService.postNewArgument(socket, replyText, node._id, node.depth+1, node.main_thread_id, $scope.role);
            });

            $scope.submitNewArgument = function(newArgumentText){
                if (newArgumentText){
                    // console.log('submiting new argument!');
                    // console.log('by : ' + $scope.role);
                    TreeService.postNewArgument(socket, newArgumentText, 0, 0, 0, $scope.role);
                    $scope.newArgument = "";
                }
            };
            
            $scope.logoutUser = function(){
                socket.emit('logout-user');
            };

            // ****** THIS FUNCTIONALITY IS NOT YET REQUESTED, BUR IT PROBABLY WILL SOMETIME
            // $scope.removeNode = function () {
            //   if ($scope.selectedNode) {
            //       var parent = getNodeById($scope.basicTree, $scope.selectedNode.parent_id);
            //       parent.sub_arguments.splice(parent.sub_arguments.indexOf($scope.selectedNode), 1);
            //       $scope.selectedNode = undefined;
            //   } else {
            //       alert("Please select one node!");
            //   }
            // };

        }]);
})();