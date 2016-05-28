(function () {
  angular.module('tree.service', ['tree.factory'])
  .service("TreeService", ["$http", "URLConfig", function ($http, URLConfig) {
    
    this.getTree = function (discId) {
      var tree = $http.get(URLConfig(discId).tree);
      return tree;
    };

    this.postNewArgument = function(dicId, argumentText, parentId, depth){
      var newDepth;
    	var postData = {
          content: argumentText,
          parent_id: parentId,
          depth: depth + 1
      };
    	var res = $http({
          method:'POST',
          url: "/api/discussions/" + dicId + "/$",
          data: postData
        });
      return res;
    };

  }]);
})();