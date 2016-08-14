module.exports = function(autoIncrement, io){

    var Discussion = require('../models/discussion');
    var User = require('../models/user');
    var Argument = require('../models/argument')(autoIncrement);
    var express = require('express');
    var router = express.Router();

    var discussionNsp = io.of('/discussions');
    var argumentsNsp = io.of('/arguments');


    /***
     *          _ _                        _
     *         | (_)                      (_)
     *       __| |_ ___  ___ _   _ ___ ___ _  ___  _ __  ___
     *      / _` | / __|/ __| | | / __/ __| |/ _ \| '_ \/ __|
     *     | (_| | \__ | (__| |_| \__ \__ | | (_) | | | \__ \
     *      \__,_|_|___/\___|\__,_|___|___|_|\___/|_| |_|___/
     *
     *
     */

    //get all the discussions by the role
    //TODO: show the discussions that the requesting user is registred to only.
    //    this may be unnecassary for the future, and just get the arguments of the relevant discussion for
    //    non-admin user.
    router.get('/discussions', function(req, res, next) {
        var user = req.session.passport.user;
        if (user){
            var role = user.role;
            switch (role) {
                case "admin":
                    Discussion.find({}, function(err, discs){
                        User.find({}, function(err, users){
                            var data = {discs : discs, users : users};
                            res.json(data);
                        });
                    });
                    break;
                case "student":
                    Discussion.find({restriction: "student"}, function(err, data){
                        // console.log(data);
                        resObj = {
                            data : data,
                            role : role
                        };
                        res.json(resObj);
                    });
                    break;
                case "instructor":
                    Discussion.find({restriction: "instructor"}, function(err, data){
                        resObj = {
                            data : data,
                            role : role
                        };
                        res.json(resObj);
                    });
            }

        }
    });

    //post a new discussion
    router.post('/discussions', function(req, res){
        // console.log('debugMesg: discussion post');
        var discussion = new Discussion();
        discussion.title = req.body.title;
        discussion.description = req.body.description;
        discussion.restriction = req.body.restriction;
        discussion.moderator_id = req.body.moderator_id;
        discussion.moderator_fname = req.body.moderator_fname;
        discussion.moderator_lname = req.body.moderator_lname;
        discussion.permittedPoster_id = req.body.permittedPoster_id;
        discussion.permittedPoster_fname = req.body.permittedPoster_fname;
        discussion.permittedPoster_lname = req.body.permittedPoster_lname;

        discussion.save(function(err, data){
            if (err)
                throw err;
            res.json(data);
        });
    });

    //get a specific discussion
    router.get('/discussions/:id', function(req, res){
        Discussion.findOne({_id: req.params.id}, function(err, data){
            res.json(data);
        });
    });

    //TODO: add this functionality to the front end
    router.delete('/discussions/:id', function(req, res, next){
        /*
         * the discussion gets a new status
         */
        var id = req.params.id;
        Discussion.findByIdAndUpdate(id, {$set: {isActive: false}}, function(err, disc){
            res.json(disc);
        });
    });

    //update an existing discussion
    router.put('/discussions/:id', function(req, res, next){
        var id = req.params.id;
        var body = req.body;

        Discussion.findByIdAndUpdate(id, body, {new: true}, function(err, disc){
            if (err) return next(err);
            if (!disc){
                return res.status(404).json({
                    message: 'Discussion with id ' + id + ' can not be found.'
                });
            }

            if(!body.moderator_id){
                disc.moderator_id = undefined;
                disc.moderator_fname = undefined;
                disc.moderator_lname = undefined;
            }
            if(!body.permittedPoster_id){
                disc.permittedPoster_id = undefined;
                disc.permittedPoster_fname = undefined;
                disc.permittedPoster_lname = undefined;
            }

            disc.save(function(err, data){
                if (err)
                    throw err;
                res.json(data);
            });
        });
    });

    discussionNsp.on('connection', function(socket){

        if (socket.request.session.passport) {
            var user = socket.request.session.passport.user;

            socket.on('new-discussion', function (newDiscussion) {
                discussionNsp.emit('new-discussion', newDiscussion);
            });
            // socket.on('delete-discussion', function(deletedDiscussion){
            //   discussionNsp.emit('delete-discussion', deletedDiscussion);
            // });
            socket.on('edit-discussion', function (editedDiscuusion) {
                // console.log('about to emit for edit discussion to everyone');
                // console.log(editedDiscuusion._id);
                discussionNsp.emit('edit-discussion');
                argumentsNsp.to(editedDiscuusion._id).emit('edit-discussion', editedDiscuusion);
            });

            socket.on('requesting-user-info', function () {
                User.findOne({_id: user.id}, function(err, user) {
                    if (err){
                        throw err;
                    }
                    else{
                        discussionNsp.emit('sending-user-info', {userInfo:user.local.info});
                    }
                });
            });

            socket.on('updating-user-info', function (data) {
                var userInfo = data.userInfo;

                User.findByIdAndUpdate(user.id, {$set: {"local.info": userInfo}}, function(err, res) {
                    if (err){
                        throw err;
                    }
                })
            });

            socket.on('request-all-logged-users', function(){
                var loggedUsers = [];

                Object.keys(io.sockets.sockets).forEach(function(sid){
                    var user = io.sockets.sockets[sid].request.session.passport.user;
                    loggedUsers.push(user.fname + " " + user.lname);
                });
                socket.emit('send-all-logged-users',{loggedUsers:loggedUsers});
            });
        }
    });


    /***
     *                                                 _
     *                                                | |
     *       __ _ _ __ __ _ _   _ _ __ ___   ___ _ __ | |_ ___
     *      / _` | '__/ _` | | | | '_ ` _ \ / _ | '_ \| __/ __|
     *     | (_| | | | (_| | |_| | | | | | |  __| | | | |_\__ \
     *      \__,_|_|  \__, |\__,_|_| |_| |_|\___|_| |_|\__|___/
     *                 __/ |
     *                |___/
     */

    function contains(myArray, searchTerm, property) {
        for(var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }

    argumentsNsp.on('connection', function(socket){
        //TODO: support here the "online" users utility for the different discussions rooms

        if (socket.request.session.passport && socket.request.session.passport.user) {

            var discussionId = socket.handshake.query.discussion;
            var user = socket.request.session.passport.user;
            // console.log(socket.request.session.passport);
            socket.join(discussionId);
            
            argumentsNsp.to(discussionId).emit('user-joined', user);
            // console.log('user ' + user.username + ' joined the discussion!');

            /**
             * EVENT1
             */
            socket.on('get-all-arguments', function(){
                // console.log('getting all the arguments from server..');
                Discussion.findOne({_id: discussionId}, function(err, discussion){
                    if (err){
                        throw err;
                    }
                    else{
                        Argument.find({disc_id: discussionId}, function(err, discArguments){
                            if (err){
                                throw err;
                            }
                            if(!discArguments){
                                console.log('ERROR retrieving the arguments..')
                            }
                            else {
                                var onlineUsers = [];
                                // console.log('==================================>');
                                Object.keys(argumentsNsp.adapter.rooms[discussionId].sockets).forEach(function(sid){
                                    var aUser = argumentsNsp.sockets[sid].request.session.passport.user;
                                    // console.log(aUser);
                                    var idx = contains(onlineUsers, aUser.username, 'username');
                                    if (idx < 0) onlineUsers.push(argumentsNsp.sockets[sid].request.session.passport.user);
                                });
                                // console.log('<==================================');
                                // console.log(onlineUsers);
                                socket.emit('init-discussion', {discArguments: discArguments, user:user, discussion: discussion, onlineUsers:onlineUsers});
                            }
                        });
                    }
                });
            });

            /**
             * EVENT2
             */
            socket.on('submitted-new-argument', function (newArgument) {
                // console.log('got new argument from client..: ', newArgument);
                var argument = new Argument();
                argument.treeStructureUpdatedAt = Date.now();
                argument.disc_id = discussionId;
                argument.parent_id = (newArgument.parent_id ? newArgument.parent_id : 0);
                argument.main_thread_id = (newArgument.main_thread_id ? newArgument.main_thread_id : 0);
                argument.user_id = user.id;
                argument.username = user.username;
                argument.role = newArgument.role;
                argument.fname = user.fname;
                argument.lname = user.lname;
                argument.color = user.color;
                argument.hidden = false;
                argument.content = newArgument.content;
                argument.depth = (newArgument.depth ? newArgument.depth : 0);
                argument.sub_arguments = [];

                // 27/07/16 - Looking up discussion restriction and (13/08/16) mod ID
                var discRest = "";
                Discussion.findOne({_id: argument.disc_id}, function(err, disc) {
                    if (err){
                        throw err;
                    }
                    else{
                        discRest = disc.restriction;
                        if(argument.user_id.equals(disc.moderator_id)){
                            argument.role = "moderator";
                        }
                    }
                });
                //-- 27/07/16

                argument.save(function(err, data){
                    if (err)
                        throw err;
                    //TODO: add here to save the new argument's id into its parent children array...Now not used anyway..
                    Argument.findOne({_id: argument.main_thread_id}, function(err, mainArg) {
                        // console.log('updating the timestamp of the mainThread..');
                        if (mainArg){
                            // 27/07/16 - New instructor discussion comments should not update the main thread update date - initiating a new field
                            // Not using role because of admin - should be discussion restriction based.
                            if(discRest == "student")
                                mainArg.treeStructureUpdatedAt = Date.now();
                            //-- 27/07/16
                            //mainArg.updatedAt = Date.now();
                            mainArg.save(function (err) {
                                if (err) throw err;
                                if (argument.depth === 0) argumentsNsp.to(discussionId).emit('submitted-new-argument', {data: data});
                                else argumentsNsp.to(discussionId).emit('submitted-new-reply', {data: data});
                            })
                        }
                        else{
                            if (argument.depth === 0) argumentsNsp.to(discussionId).emit('submitted-new-argument', {data: data});
                            else argumentsNsp.to(discussionId).emit('submitted-new-reply', {data: data});
                        }
                    })

                });
            });

            /**
             * EVENT3
             */
            socket.on('update-online-users-list', function () {
                // console.log('*********************************');
                var onlineUsers = [];
                Object.keys(argumentsNsp.adapter.rooms[discussionId].sockets).forEach(function(sid){
                    var aUser = argumentsNsp.sockets[sid].request.session.passport.user;
                    // console.log(aUser);
                    var idx = contains(onlineUsers, aUser.username, 'username');
                    if (idx < 0) onlineUsers.push(argumentsNsp.sockets[sid].request.session.passport.user);
                });
                // console.log(onlineUsers);
                // console.log('*********************************');
                argumentsNsp.to(discussionId).emit('new-online-users-list', onlineUsers);
            });

            /**
             * EVENT4
             */
            socket.on('disconnect', function () {
                console.log('DISCONNECT EVENT! by: ' + user.username);
                socket.leave(discussionId);
                if (argumentsNsp.adapter.rooms[discussionId]) {
                    argumentsNsp.to(discussionId).emit('user-left');
                }
            });

            /**
             * EVENT5
             */
            socket.on('logout-user', function () {
                Object.keys(argumentsNsp.adapter.rooms[discussionId].sockets).forEach(function(sid){
                    if (argumentsNsp.sockets[sid].request.session.passport.user.username === user.username){
                        argumentsNsp.sockets[sid].emit('logout-redirect', '/auth/logout');
                        argumentsNsp.sockets[sid].request.logout();
                    }
                });
            });

            /**
             * EVENT6 - admin hid or revealed argument
             */
            socket.on('flip-argument-hidden-status', function (data) {
                var argumentID = data._id;
                Argument.findOne({_id: argumentID}, function(err, argument) {
                    if (err){
                        throw err;
                    }
                    else{
                        argument.hidden = !argument.hidden;
                        argument.save(function (err) {
                            if (err){
                                throw err;
                            }
                            else{
                                argumentsNsp.to(argument.disc_id).emit('flip-argument-hidden-status', {_id: argumentID});
                            }
                        })
                    }
                });
            });

            socket.on('requesting-user-info', function (data) {
                User.findOne({_id: data._id}, function(err, user) {
                    if (err){
                        throw err;
                    }
                    else{
                        argumentsNsp.to(discussionId).emit('sending-user-info', {userInfo:user.local.info});
                    }
                });
            });


        }
    });

    return router;

};

