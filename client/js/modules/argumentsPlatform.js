(function(){
  angular.module('argumentsApp', ['tree.service','TreeWidget','btford.socket-io', 'socketio.factory'], function($locationProvider){
      $locationProvider.html5Mode(true);
  })
  .controller('ArgumentsTreeController', ['TreeService','$scope', '$location','socketio', function (TreeService, $scope, $location, socketio) {
    var path = $location.path();
    var discId = path.split('/')[1];

    function fromReftoNestedJson(refJson){
      var refJsonMap = refJson.reduce(function(map, node) {
        map[node._id] = node;
        return map;
      }, {});
      var nestedJson = [];

      var maxDate = ' ';

      refJson.forEach(function(node) {
        if (node.createdAt > maxDate){
          maxDate = node.createdAt;
          $scope.lastPost = node;
        }
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
      return nestedJson;

    }

    //on page load...
    function init() {
      TreeService.getTree(discId).
      then(function (result) {
        // the flattened list of the tree, for the $watch of the scope

        $scope.treeWithRef = result.data.slice(0,result.data.length-1);
        $scope.treeNested = fromReftoNestedJson($scope.treeWithRef);
        if ($scope.lastPost) $scope.lastPost.lastPost = true;
      }, function (err) {
          alert("Arguments not available, Error: " + err);
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

    init();

    //function for sticking the "new argument" box at the top of the screen when scrolling the page
    setTimeout(function doIt(){
      $(window).on("scroll", function(e){
        var screenTop = $(window).scrollTop();
        var anchorTop = $("#scroller-anchor").offset().top;
        var newArgumentTop=$("#scroller");
        var treeConversation = $("#treeConversation");
        if (screenTop>anchorTop) {
          newArgumentTop.css({position:"fixed",top:"0px", "z-index":999});
          treeConversation.css({"margin-top":"200px"});
        } else {
          newArgumentTop.css({position:"relative"});
          treeConversation.css({"margin-top":"0px"});
        }
      });

    }, 0);
    

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

    // var socket = socketio.arguments({discussion: discId});
    var socket = socketio.arguments();

    $(window).on('beforeunload', function(){
      socket.disconnect();
    });

    socket.on('submitted-new-argument', function(newArgument){
      // $scope.treeNested.push(newArgument); 
      $scope.treeNested.unshift(newArgument); 
      if ($scope.lastPost){
        $scope.lastPost.lastPost = false;
      }  
      newArgument.lastPost = true;
      $scope.lastPost = newArgument;
    });

    socket.on('submitted-new-reply', function(newReply){
      var parentNode = getNodeById($scope.treeNested, newReply.parent_id);
      var mainThread = getNodeById($scope.treeNested, newReply.main_thread_id);
      // console.log(parentNode);
      // console.log(mainThread);
      var mainThreadInd = $scope.treeNested.indexOf(mainThread);
      // console.log(mainThreadInd);
      $scope.treeNested.splice(mainThreadInd, 1);
      $scope.treeNested.unshift(mainThread);
      parentNode.sub_arguments.push(newReply);
      parentNode.expanded = true;
      if ($scope.lastPost){
        $scope.lastPost.lastPost = false;
      }
      newReply.lastPost = true;
      $scope.lastPost = newReply;
    });

    $scope.$on('submitted-new-reply', function (e, args) {
      var node = args.node;
      var replyText = args.replyText;
      // console.log('bbb');
      TreeService.postNewArgument(discId, replyText, node._id, node.depth+1, node.main_thread_id);
    });

    $scope.submitNewArgument = function(newArgument){
      if (newArgument){
        // console.log('aaa');
        TreeService.postNewArgument(discId, newArgument, 0, 0);
        $scope.newArgument = "";
      }
      
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