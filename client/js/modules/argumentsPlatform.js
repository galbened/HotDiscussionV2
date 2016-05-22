(function(){
  angular.module('argumentsApp', ['tree.service','TreeWidget'], function($locationProvider){
      $locationProvider.html5Mode(true);
  })
  .controller('ArgumentsTreeController', ['TreeService','$scope', '$location', function (TreeService, $scope, $location) {
    var path = $location.path();
    var discId = path.split('/')[1];

    function fromReftoNestedJson(refJson){
      var refJsonMap = refJson.reduce(function(map, node) {
        map[node._id] = node;
        return map;
      }, {});
      var nestedJson = [];

      refJson.forEach(function(node) {
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
          nestedJson.push(node);
        }
      });

      return nestedJson;

    }

    //on page load...
    function init() {
      TreeService.getTree(discId).
      then(function (result) {
        // the flattened list of the tree, for the $watch of the scope
        $scope.treeWithRef = result.data;
        $scope.treeNested = fromReftoNestedJson($scope.treeWithRef);
        
      }, function (err) {
          alert("Arguments not available, Error: " + err);
      });
    }

    // if I will need to get the node object by its ID. Now, I don't use it...
    function getNodeById(tree, nodeId) {
      if (!tree) { return null; }
      for (var i = 0; i < tree.length; i++) {
          if (tree[i].nodeId == nodeId) {
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
    $scope.newNodesCount = 0;

    $scope.$on('submitted-new-reply', function (e, args) {
      var node = args.node;
      var replyText = args.replyText;
      $scope.newNodesCount++; //TODO: deprecate?
      TreeService.postNewArgument(discId, replyText, node._id, node.depth).
      then(function (result) {
        //TODO: transfer the referenced jsons to nested jsons
        node.sub_arguments.push(result.data);
      }, function (err) {
          alert("Error: " + err);
      });

    });

    $scope.submitNewArgument = function(newArgument){
      if (newArgument){
        $scope.newNodesCount++;
        TreeService.postNewArgument(discId, newArgument, 0)
        .then(function success(res){
          $scope.treeNested.push(res.data);
        },function error(err){
          console.log(err);
        });
      }
      $scope.newArgument = "";
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