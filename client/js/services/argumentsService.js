(function () {
    angular.module('tree.service', ['tree.factory'])
        .service("TreeService", ["$http", "URLConfig", function ($http, URLConfig) {

            // this.getTree = function (socket, discId) {
            //     // var tree = $http.get(URLConfig(discId).tree);
            //     // return tree;
            //     socket.emit('get-all-arguments');
            // };

            this.postNewArgument = function(socket, argumentText, parentId, depth, main_thread_id){
                console.log('sending the new arg AJAX..');
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
                /*if (depth === 0){
                    console.log('emiting the server the new argument: ' + JSON.stringify(postData));
                    socket.emit('submitted-new-argument', postData);
                }
                else {
                    var res = $http({
                        method:'POST',
                        url: "/api/discussions/" + discId + "/$",
                        data: postData
                    });
                    return res;
                }*/
                socket.emit('submitted-new-argument', postData);
            };

        }]);
})();