(function () {
    angular.module('tree.service', ['tree.factory'])
        .service("TreeService", function () {

            this.postNewArgument = function(socket, argumentText, parentId, depth, main_thread_id, role){
                // console.log('sending the new arg AJAX..');
                // console.log("by role--> " + role);
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
                    main_thread_id: new_main_thread_id,
                    role:role
                };
                
                socket.emit('submitted-new-argument', postData);
            };

        });
})();