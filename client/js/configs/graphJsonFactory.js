(function () {
    angular.module('graph.factory', [])
        .factory("networkGraphFactory", [function () {
            return {
                getDiscussionNetworkJSON: function(argsMap){

                    var users = {};
                    var argByUser = {};
                    var userToUserCount = {};

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            var name = argsMap[key].fname + " " + argsMap[key].lname;
                            name = name.substr(0,8);
                            users[argsMap[key].user_id] = {"user_id":argsMap[key].user_id, "name":name, "color":argsMap[key].color};
                            argByUser[argsMap[key]._id] = argsMap[key].user_id;
                        }
                    }

                    var nodes = [];
                    var edges = [];

                    for(var key in users){
                        if (users.hasOwnProperty(key)) {
                            var nodeJson = {"id":users[key].user_id,"label": users[key].name,"color":users[key].color,"shape":"circle","shadow":true,
                                "scaling": {"label":{"enabled": true}},"shadow":true};
                            nodes.push(nodeJson);
                        }
                    }

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            if(argsMap[key].parent_id){
                                var userFrom = argsMap[key].user_id;
                                var userTo  = argByUser[argsMap[key].parent_id];
                                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]=0;
                            }
                        }
                    }

                    var argsMapFiltered = {};

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            if(argsMap[key].parent_id){
                                var userFrom = argsMap[key].user_id;
                                var userTo  = argByUser[argsMap[key].parent_id];
                                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]++;
                                if(userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]==1){
                                    argsMapFiltered[key] = {user_id:argsMap[key].user_id,parent_id:argsMap[key].parent_id};
                                }
                            }
                        }
                    }

                    for(var key in argsMapFiltered){
                        if (argsMapFiltered.hasOwnProperty(key)) {
                            if(argsMapFiltered[key].parent_id){
                                var userFrom = argsMapFiltered[key].user_id;
                                var userTo  = argByUser[argsMapFiltered[key].parent_id];
                                var count = userToUserCount[userFrom + userTo];
                                var edge = {"from":userFrom,"to":userTo, arrows: { enabled: true, to: true }, "physics":true,
                                    "label":count,"width":count/1.4, length: 350};
                                edges.push(edge)
                            }
                        }
                    }

                    var options = {
                        autoResize: true,
                        height: '700',
                        width: '100%'
                    };

                    return {
                        edges:edges,
                        nodes:nodes,
                        options:options
                    };
                },
                getUserNetworkJSON: function(argsMap,user_id){

                    var users = {};
                    var argByUser = {};
                    var userToUserCount = {};

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            var name = argsMap[key].fname + " " + argsMap[key].lname;
                            name = name.substr(0,8);
                            users[argsMap[key].user_id] = {"user_id":argsMap[key].user_id, "name":name, "color":argsMap[key].color};
                            argByUser[argsMap[key]._id] = argsMap[key].user_id;
                        }
                    }

                    var nodes = [];
                    var nodesFiltered = [];
                    var edges = [];

                    for(var key in users){
                        if (users.hasOwnProperty(key)) {
                            var nodeJson = {"id":users[key].user_id,"label": users[key].name,"color":users[key].color,"shape":"circle","shadow":true,
                                "scaling": {"label":{"enabled": true}},"shadow":true};
                            if(users[key].user_id == user_id){
                                nodeJson = {"id":users[key].user_id,"label": users[key].name,"color":users[key].color,"shape":"square","shadow":true,
                                    "scaling": {"label":{"enabled": true}},"shadow":true, size:40, font:{size:25}};
                            }
                            nodes.push(nodeJson);
                        }
                    }

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            if(argsMap[key].parent_id){
                                var userFrom = argsMap[key].user_id;
                                var userTo  = argByUser[argsMap[key].parent_id];
                                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]=0;
                            }
                        }
                    }

                    var argsMapFiltered = {};

                    for(var key in argsMap){
                        if (argsMap.hasOwnProperty(key)) {
                            if(argsMap[key].parent_id){
                                var userFrom = argsMap[key].user_id;
                                var userTo  = argByUser[argsMap[key].parent_id];
                                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]++;
                                if(userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]==1){
                                    argsMapFiltered[key] = {user_id:argsMap[key].user_id,parent_id:argsMap[key].parent_id};
                                }
                            }
                        }
                    }

                    for(var key in argsMapFiltered){
                        if (argsMapFiltered.hasOwnProperty(key)) {
                            if(argsMapFiltered[key].parent_id){
                                var userFrom = argsMapFiltered[key].user_id;
                                var userTo  = argByUser[argsMapFiltered[key].parent_id];
                                var count = userToUserCount[userFrom + userTo];
                                var edge = {"from":userFrom,"to":userTo, arrows: { enabled: true, to: true }, "physics":true,
                                    "label":count,"width":count/1.4, length: 350};
                                if((userFrom == user_id)||(userTo == user_id))
                                    edges.push(edge)
                            }
                        }
                    }

                    var options = {
                        autoResize: true,
                        height: '600',
                        width: '100%'
                    };

                    return {
                        edges:edges,
                        nodes:nodes,
                        options:options
                    };
                }
            }
        }]);
})();

