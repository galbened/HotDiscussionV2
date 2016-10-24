(function(){
    angular.module('argumentsApp', ['tree.service','TreeWidget','btford.socket-io', 'socketio.factory','ngSanitize','ui.bootstrap',
                                    'ui.tinymce','bootstrapModalApp','discussionChat','discussionCollaborationPad','ngVis','graph.factory'], function($locationProvider){
        $locationProvider.html5Mode(true);
    })
        .controller('ArgumentsTreeController', ['TreeService','$scope', '$window', '$location','socketio','$rootScope', function (TreeService, $scope, $window, $location, socketio, $rootScope) {
            $scope.onlineUsers = [];

            var path = $location.path();
            var discId = path.split('/')[1];
            var socket = socketio.arguments({discussion: discId})

            $scope.socket = socket;
            $rootScope.highlightedPadText = {start:0,end:0};

            var lastPostsArray = [];
            const lastPostsArraySIZE = 10;

            var focusedNodes = [];

            $scope.tinymceOptions = {

                //just for placeholder
                setup: function(editor) {

                    editor.on('init', function () {
                        // Default classes of tinyMCE are a bit weird
                        // I add my own class on init
                        // this also sets the empty class on the editor on init
                        tinymce.DOM.addClass( editor.bodyElement, 'content-editor empty');
                    });

                    // You CAN do it on 'change' event, but tinyMCE sets debouncing on that event
                    // so for a tiny moment you would see the placeholder text and the text you you typed in the editor
                    // the selectionchange event happens a lot more and with no debouncing, so in some situations
                    // you might have to go back to the change event instead.
                    editor.on('selectionchange', function () {
                        if ( editor.getContent() === "" ) {
                            tinymce.DOM.addClass( editor.bodyElement, 'empty' );
                        } else {
                            tinymce.DOM.removeClass( editor.bodyElement, 'empty' );
                        }
                    });

                    editor.addButton('mybutton', {
                        text: 'PAD',
                        icon: false,
                        onclick: function () {
                            var highlightLen = $rootScope.highlightedPadText.end - $rootScope.highlightedPadText.start;
                            if(highlightLen == 0){
                                alert("לא נבחר טקסט מתוך המאמר.");
                            }
                            else{
                                var selectedContent = tinymce.activeEditor.selection.getContent();
                                editor.insertContent('&nbsp;<button class="btn btn-xs btn-info" ng-click="ofCtrl.markPad(' +
                                    $rootScope.highlightedPadText.start + ',' + $rootScope.highlightedPadText.end +
                                    ')">' + selectedContent +'</button>&nbsp;');
                            }
                        }
                    });
                },

                forced_root_block : "",
                selector: 'div.tinymce',
                theme: 'inlite',
                inline: true,
                plugins: "autolink textcolor",
                extended_valid_elements : "a[href|target=_blank]",
                selection_toolbar: 'bold italic underline forecolor | quicklink mybutton',
                invalid_elements : 'img[*]',
                valid_elements : 'a[href|target=_blank],strong/b,br,em,span[*],button[*]',
                valid_styles: {
                    'span': 'text-decoration,color',
                }
            };

            setTreeConversationTop();

            var refJsonMap = {};

            function fromReftoNestedJson(refJson){
                refJsonMap = refJson.reduce(function(map, node) {
                    map[node._id] = node;
                    return map;
                }, {});
                var nestedJson = [];

                var maxDate = ' ';

                var nodesCopy = [];

                refJson.forEach(function(node) {

                    nodesCopy.push(node);

                    node.userInfo = "טוען...";

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

                    node.subtreeSize = 0
                    node.isBlinking = false;
                });

                //initiating last five comments array
                initLastPostsArray(nodesCopy);

                countTreeNodesSubtreeSizes(nestedJson);
                initTreeNodesSubtreeNewestNodes(nestedJson);

                return nestedJson;
            }

            function countTreeNodesSubtreeSizes(tree){
                if(tree.length == 0){
                    return 0;
                }

                var counter = 0;
                for(var i = 0; i < tree.length; i++) {
                    tree[i].subtreeSize = countTreeNodesSubtreeSizes(tree[i].sub_arguments) + tree[i].sub_arguments.length;
                    counter = counter + tree[i].subtreeSize;
                }
                return counter;
            };

            function initTreeNodesSubtreeNewestNodes(tree){
                var node = {createdAt:new Date(-8640000000000000)};
                if(tree.length == 0){
                    return node;
                }
                var iterNewestNode, newestNode = tree[0];
                for(var i = 0; i < tree.length; i++) {
                    tree[i].subtreeNewestNode = initTreeNodesSubtreeNewestNodes(tree[i].sub_arguments);
                    if(tree[i].subtreeNewestNode < tree[i].createdAt){
                        iterNewestNode = tree[i];
                    }
                    else{
                        iterNewestNode = tree[i].subtreeNewestNode;
                    }
                    if(newestNode.createdAt < iterNewestNode.createdAt)
                        newestNode = iterNewestNode;
                }
                return newestNode;
            };

            function newNodeUpdateSubtreeSizesAndNewest(node){
                node.subtreeSize = 0;
                //node.subtreeNewestNode = {createdAt:new Date(-8640000000000000)};;
                refJsonMap[node.parent_id];
                var parentNode = refJsonMap[node.parent_id];
                if(parentNode){
                    parentNode.subtreeNewestNode = node;
                    updateTreeNodesSubtreeSizesByNodeRec(parentNode);
                }
            }

            function updateTreeNodesSubtreeSizesByNodeRec(node){
                //Give each node reference to its parent node is the better option than getNodeById
                //However, js doesn't permit circular reference.
                node.subtreeSize = node.subtreeSize + 1;
                refJsonMap[node.parent_id];
                var parentNode = refJsonMap[node.parent_id];
                //console.log("hey")
                if(parentNode) {
                    parentNode.subtreeNewestNode = node.subtreeNewestNode;
                    updateTreeNodesSubtreeSizesByNodeRec(parentNode);
                }
            }

            function updateLastPostsArray(newNode){
                //adds new created node to the last five, removing the oldest of the five
                lastPostsArray.unshift(newNode);
                newNode.lastPost = true;

                if(lastPostsArray.length>lastPostsArraySIZE)
                {
                    lastPostsArray[lastPostsArraySIZE].lastPost = false;
                    lastPostsArray.pop();
                }
            }

            function initLastPostsArray(nodesCopy){
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

                //takes most recent lastPostsArraySIZE nodes or less than lastPostsArraySIZE
                for(var index = 0;index<lastPostsArraySIZE && index<nodesCopy.length;index++)
                {
                    nodesCopy[index].lastPost = true;
                    lastPostsArray.push(nodesCopy[index]);
                }
            }

            function sortArgumnets(argArray){
                argArray.sort(function(argA,argB){
                    if(argA.treeStructureUpdatedAt < argB.treeStructureUpdatedAt){
                        return 1;
                    }
                    if (argA.treeStructureUpdatedAt > argB.treeStructureUpdatedAt){
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

                    if(result.user.id == result.discussion.moderator_id)
                        $scope.role = "moderator";  // done also on server side API when new args is sent

                    $scope.user_id = result.user.id;

                    if((result.discussion.permittedPoster_id == null) || ($scope.user_id == result.discussion.permittedPoster_id) || ($scope.role == 'admin'))
                        $scope.isPermittedPoster = true;


                    // UPDATE #1 - retrieving discussion restriction and current session username into scope
                    $scope.discussionRestriction = result.discussion.restriction;

                    $scope.username = result.user.username;

                    $scope.fullname = result.user.fname + " " + result.user.lname;

                    $scope.originalFocus = $scope.treeNested;

                    $scope.chatMessages = result.chatMessages;

                    $scope.content = result.discussion.content;
                    $scope.showContent = result.discussion.content;

                    $scope.locked = result.discussion.locked;
                });
            }

            /*
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
            */

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
            /*
            setTimeout(function doIt(){
              $(window).on("scroll", function(e){
                var screenTop = $(window).scrollTop();
                var anchorTop = $("#scroller-anchor").offset().top;
                var newArgumentTop=$("#scroller");
                var treeConversation = $("#treeConversation");
                if (screenTop>anchorTop) {
                    //screen top is no longer larger than anchor top after scrolling
                    console.log("bla")
                  newArgumentTop.css({position:"fixed",top:"0px", "z-index":999});
                  //treeConversation.css({"margin-top":"200px"});
                } else {
                    //
                  newArgumentTop.css({position:"relative"});
                  //treeConversation.css({"margin-top":"0px"});
                }
              });

            }, 0);

            */

            function setTreeConversationTop(){
                var scrollerHeight = $('#scroller').height();
                var treeConversation = $("#treeConversation");
                var CollaborationPad = $("#CollaborationPad");
                treeConversation.css({"margin-top":scrollerHeight});
                CollaborationPad.css({"margin-top":scrollerHeight+15});
            }

            $(window).on('beforeunload', function(){
                socket.disconnect();
            });

            socket.on('submitted-new-argument', function(data){
                var newArgument = data.data;
                refJsonMap[newArgument._id] = newArgument;
                $scope.originalFocus.unshift(newArgument);
                updateLastPostsArray(newArgument);
                //newNodeUpdateSubtreeSizesAndNewest(newArgument);
            });

            $scope.getArgsMap = function(){
                return refJsonMap;
            };

            socket.on('submitted-new-reply', function(data){

                var newReply = data.data;
                refJsonMap[newReply._id] = newReply;

                //var parentNode = getNodeById($scope.originalFocus, newReply.parent_id);
                //var mainThread = getNodeById($scope.originalFocus, newReply.main_thread_id);

                var parentNode = refJsonMap[newReply.parent_id];
                var mainThread = refJsonMap[newReply.main_thread_id];

                var mainThreadInd = $scope.originalFocus.indexOf(mainThread);

                // UPDATE #1 - condition added on 18/07 - only student discussions should see live updates from other users on top
                if($scope.discussionRestriction == "student") {
                    $scope.originalFocus.splice(mainThreadInd, 1);
                    $scope.originalFocus.unshift(mainThread);
                }
                //else
                //    $scope.newMessages = true;
                /*
                else TODO notifications for instructor discussion
                 */

                console.log()
                parentNode.sub_arguments.push(newReply);
                parentNode.expanded = true;

                updateLastPostsArray(newReply);
                newNodeUpdateSubtreeSizesAndNewest(newReply);
            });

            socket.on('edit-discussion', function(edittedDiscussion){
                if (edittedDiscussion.restriction === $scope.role || $scope.role === 'admin'){
                    $scope.discussionTitle = edittedDiscussion.title;
                    $scope.discussionDescription = edittedDiscussion.description;

                    if((edittedDiscussion.permittedPoster_id == null) || ($scope.user_id == edittedDiscussion.permittedPoster_id) || ($scope.role == 'admin'))
                        $scope.isPermittedPoster = true;
                    else
                        $scope.isPermittedPoster = false
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

            socket.on('flip-argument-hidden-status', function(data){
                var argumentID = data._id;
                var node = refJsonMap[argumentID];
                node.hidden = !node.hidden;
            });

            socket.on('flip-argument-trimmed-status', function(data){
                var argumentID = data._id;
                var node = refJsonMap[argumentID];
                node.trimmed = !node.trimmed;
            });

            socket.on('flip-discussion-locked-status', function(){
                $scope.locked = !$scope.locked;
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
                    //newArgumentText = $filter('linky')(newArgumentText,"_blank");
                    // console.log('submiting new argument!');
                    // console.log('by : ' + $scope.role);
                    TreeService.postNewArgument(socket, newArgumentText, 0, 0, 0, $scope.role);
                    $scope.newArgument = "";
                }
            };

            $scope.$on('focus-on-node', function (e, args) {
                //saving previous focus, position and new node (nextNode)
                var node = args.node;

                focusedNodes.push({focus: $scope.treeNested, scrollerPos:$window.scrollY, nextNode:node});

                node.isFocused = true;
                $scope.treeNested = [node];

                $window.scrollTo(0, 0);

                $scope.backButton = true;
            });

            $scope.clickBackButton = function(){
                var previous = focusedNodes.pop();

                //console.log(previous)

                previous.nextNode.isFocused = false;

                $scope.treeNested = previous.focus;

                setTimeout(function(){$window.scrollBy(0,previous.scrollerPos - $window.scrollY)},50);

                if(focusedNodes.length == 0)
                    $scope.backButton = false;
            };
            
            $scope.logoutUser = function(){
                socket.emit('logout-user');
            };

            $scope.flipDiscussionLock = function(){
                socket.emit('flip-discussion-locked-status');
            };

            $scope.$on('flip-argument-hidden-status', function (e,data) {
                var argumentID = data._id;
                socket.emit('flip-argument-hidden-status',{_id: argumentID});
            });

            $scope.$on('flip-argument-trimmed-status', function (e,data) {
                var argumentID = data._id;
                //refJsonMap[argumentID].trimmed = !refJsonMap[argumentID].trimmed;
                socket.emit('flip-argument-trimmed-status',{_id: argumentID});
            });

            $scope.$on('parentBlinker', function (e,data) {
                var parentNode = refJsonMap[data.parentID];
                parentNode.isBlinking = !parentNode.isBlinking;
            });

            $scope.$on('mark-text-in-pad',function(e,data){
                if(JSON.stringify($scope.lastMarked) === JSON.stringify(data)){
                    $scope.$broadcast('shut-pad-ctrl');
                    return;
                }
                $scope.lastMarked = data;
                $scope.$broadcast('mark-text-in-pad-ctrl',{start: data.start,end: data.end});
            });

            $scope.$on('request-user-info-update', function(e,node){
                socket.on('sending-user-info', function(data){
                    if(data.userInfo == null)
                        node.userInfo = "משתמש זה לא כתב ביוגרפיה."
                    else
                        node.userInfo = data.userInfo
                });

                socket.emit('requesting-user-info', {_id:node.user_id})
            });


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