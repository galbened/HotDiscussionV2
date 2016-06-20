(function () {
  angular.module('tree.service', ['tree.factory'])
  .service("TreeService", ["$http", "URLConfig", function ($http, URLConfig) {
    
    this.getTree = function (discId) {
      var tree = $http.get(URLConfig(discId).tree);
      return tree;
    };

    this.postNewArgument = function(discId, argumentText, parentId, depth, main_thread_id){
      var new_main_thread_id;
      if (!depth){
        new_main_thread_id = 0;
      }
      else if (depth === 1){
        new_main_thread_id = parentId;
      }
      else{
        new_main_thread_id = main_thread_id;
      }
      // console.log(new_main_thread_id);
    	var postData = {
          content: argumentText,
          parent_id: parentId,
          depth: depth,
          main_thread_id: new_main_thread_id
      };
    	var res = $http({
          method:'POST',
          url: "/api/discussions/" + discId + "/$",
          data: postData
        });
      return res;
    };

  }]);
})();