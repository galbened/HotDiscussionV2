module.exports = function(autoIncrement, io){

    var Discussion = require('../models/discussion');
    var User = require('../models/user');
    var Pm = require('../models/pm');
    var Chat = require('../models/chat');
    var usersGroup = require('../models/users_group');
    var Argument = require('../models/argument')(autoIncrement);
    var express = require('express');
    var router = express.Router();

    var discussionDuplicator = require('../tools/discussionDuplicator')(autoIncrement);

    var discussionNsp = io.of('/discussions');
    var argumentsNsp = io.of('/arguments');

    var allScokets = {};

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

    var getAllGroupsConsistsOfUser = function(user_id){
        usersGroup.find({users: { $in : [user_id]}},function(err, groups){
            return groups;
        });
    };

    router.get('/discussions', function(req, res, next) {
        var user = req.session.passport.user;
        var groupsOfUser = usersGroup.find({users: { $in : [user.id]}});
        usersGroup.find({users: { $in : [user.id]}}, {_id:1},function(err, groupsOfUser){
            if (user){
                var role = user.role;
                switch (role) {
                    case "admin":
                        Discussion.find().lean().exec( function(err, discs){
                            //for sync foreach
                            var discProcessed = 0;

                            if(discs.length == 0){
                                User.find({}, function(err, users){
                                    var data = {discs : discs, users : users};
                                    res.json(data);
                                });
                            }
                            else{
                                discs.forEach(function(disc){
                                    Argument.count({disc_id:disc._id}, function(err, count){
                                        disc.args_count = count;
                                        discProcessed++;
                                        if(discProcessed == discs.length){
                                            User.find({}, function(err, users){
                                                usersGroup.find({}, function(err, groups){
                                                    var data = {discs : discs, users : users, groups:groups};
                                                    res.json(data);
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                        break;

                    case "student":
                        Discussion.find({restriction: "student", $or: [{users_group_id: {$in: groupsOfUser}},{users_group_id:null}]}).lean().exec( function(err, discs){
                            //for sync foreach
                            var discProcessed = 0;

                            if(discs.length == 0){
                                resObj = {data : discs,role : role};
                                res.json(resObj);
                            }
                            else{
                                discs.forEach(function(disc){
                                    Argument.count({disc_id:disc._id}, function(err, count){
                                        disc.args_count = count;
                                        discProcessed++;
                                        if(discProcessed == discs.length){
                                            resObj = {data : discs,role : role};
                                            res.json(resObj);
                                        }
                                    });
                                });
                            }
                        });
                        break;
                    case "instructor":
                        Discussion.find({restriction: "instructor", $or: [{users_group_id: {$in: groupsOfUser}},{users_group_id:null}]}).lean().exec( function(err, discs){
                            //for sync foreach
                            var discProcessed = 0;

                            if(discs.length == 0){
                                resObj = {data : discs,role : role};
                                res.json(resObj);
                            }
                            else{
                                discs.forEach(function(disc){
                                    Argument.count({disc_id:disc._id}, function(err, count){
                                        disc.args_count = count;
                                        discProcessed++;
                                        if(discProcessed == discs.length){
                                            resObj = {data : discs,role : role};
                                            res.json(resObj);
                                        }
                                    });
                                });
                            }
                        });
                        break;
                }
            }
        });
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
        discussion.users_group_id = req.body.users_group_id;

        //Adding chat to discussion 09/09
        var chat = new Chat();
        discussion.chat_id = chat._id;

        chat.save(function(err, data){
            if (err)
                throw err;
            discussion.save(function(err, data){
                if (err)
                    throw err;
                res.json(data);
            });
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
            if(!body.users_group_id){
                disc.users_group_id = undefined;
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

            allScokets[user.id] = socket;

            socket.on('disconnect', function () {
                delete allScokets[user.id];
            });

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

                Object.keys(allScokets).forEach(function(sid){
                    if(allScokets[sid].request.session.passport)
                    {
                        var user = allScokets[sid].request.session.passport.user;
                        loggedUsers.push(user.fname + " " + user.lname);
                    }
                });

                socket.emit('send-all-logged-users',{loggedUsers:loggedUsers});
            });

            /*
            Users groups in dashboard
             */

            socket.on('request-users-groups', function () {
                usersGroup.find({}, function(err,groups){
                    if(err) throw err;
                    else
                        socket.emit('sending-users-groups',{users_groups : groups});
                });
            });

            socket.on('create-users-group', function (data) {
                var newGroup = new usersGroup();

                newGroup.name = data.users_group.name;
                newGroup.body_prefix = data.users_group.body_prefix;
                newGroup.users = [];

                data.users_group.users.forEach(function(user){
                    console.log("user is : " + user)
                    newGroup.users.push(user._id);
                })

                newGroup.save(function(err, data){
                    if (err)
                        throw err;
                });
            });

            socket.on('update-users-group', function (data) {

                var id = data.users_group._id;

                var updatedGroup = {};

                updatedGroup.name = data.users_group.name;
                updatedGroup.body_prefix = data.users_group.body_prefix;
                updatedGroup.users = [];

                data.users_group.users.forEach(function(user){
                    updatedGroup.users.push(user._id);
                });

                usersGroup.findByIdAndUpdate(id, updatedGroup, {new: true}, function(err, group){
                    if (err) return next(err);
                });
            });

            socket.on('new-pm', function (data) {

                var senderID = socket.request.session.passport.user.id;

                usersGroup.findById(data.group_id, function(err, group){
                    if(err) throw err;
                    else{
                        group.users.forEach(function(receiverID){
                            var newPM = new Pm();
                            newPM.sender_id = senderID;
                            newPM.receiver_id = receiverID;

                            newPM.body = data.body;
                            newPM.isRead = false;

                            newPM.save(function(err, data){
                                if (err)
                                    throw err;
                            });

                            sendPM(newPM);
                        });
                    }
                });
            });

            var sendPM = function(msg){
                var allSocketCounter = 0,
                    msgSent = false;
                Object.keys(allScokets).forEach(function(sid){
                    allSocketCounter++;
                    if(allScokets[sid].request.session.passport.user.id == msg.receiver_id){
                        allScokets[sid].emit('sending-pm',{body:msg.body});
                        msgSent = true;
                    }

                    //if user is offline, save unread message for when user comes online.
                    if((allSocketCounter==Object.keys(allScokets).length)&&(!msgSent)){
                        User.findByIdAndUpdate(msg.receiver_id, {$push: {"local.unreadMessages":msg}}, {new: true}, function(err, user){
                            if(err) throw err;
                        });
                    }
                });
            };

            socket.on('check-unread-messages',function(){
                var userID = socket.request.session.passport.user.id;
                User.findById(userID, function(err, user){
                    var unreadMsgs = user.local.unreadMessages;
                    var unreadMessagesCount = 0;
                    if(unreadMsgs){
                        unreadMsgs = unreadMsgs.reverse();
                        unreadMsgs.forEach(function(msgID){
                            unreadMessagesCount++;
                            Pm.findById(msgID,function(err,msg){
                                sendPM(msg);
                                if(unreadMsgs.length == unreadMessagesCount){
                                    User.findByIdAndUpdate(userID, {$set: {"local.unreadMessages":[]}}, {new: true}, function(err,user){
                                        if(err) throw err;
                                    });
                                }
                            })
                        });
                    };
                });
            });

            socket.on('update-discussion-content',function(data){
                Discussion.findByIdAndUpdate(data.disc_id, {$set: {"content":data.content}}, {new: true}, function(err, disc){
                    if(err) throw err;
                })
            });

            socket.on('requesting-discussion-content',function(data){
                Discussion.findById(data.disc_id, function(err, disc) {
                    if (err) throw err;
                    socket.emit('sending-discussion-content', {content:disc.content});
                });
            });

            socket.on('copy-discussion',function(data){
                discussionDuplicator(data.disc_id, function(res){
                    discussionNsp.emit('copied-discussion', {newDisc:res.newDisc,args_count:res.args_count});
                });
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

            allScokets[user.id] = socket;

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

                        //Adding chat to discussion 09/09 -- TEMPORARY - redundant after new DB is created
                        if(discussion.chat_id == null){
                            var chat = new Chat();
                            discussion.chat_id = chat._id;

                            chat.save(function(err, data){
                                if (err)
                                    throw err;
                                Discussion.findByIdAndUpdate(discussion._id, {$set: {chat_id:chat._id}}, {new: true}, function(err, chat){
                                    if(err) throw err;
                                });
                            });
                        }


                        Chat.findById(discussion.chat_id,function(err,chat){
                            if(err) throw err;
                            if(chat == null) chat = {messages: []};
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

                                    socket.emit('init-discussion', {discArguments: discArguments, user:user, discussion: discussion, onlineUsers:onlineUsers, chatMessages:chat.messages});
                                }
                            });
                        })
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
                        // 19/08/16 - indicator whether admin posted from student or insturctor discussion
                        if(argument.role == "admin"){
                            if(discRest == "student"){
                                argument.role = "adminFromStudent"
                            }
                            else{ //instructor
                                argument.role = "adminFromInstructor"
                            }
                        }
                        else{
                            if(argument.user_id.equals(disc.moderator_id)){
                                argument.role = "moderator";
                            }
                        }
                    }

                    //-- 27/07/16
                    if(discRest == "none")
                        return; // Inactive discussion doesn't accept new arguments.
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
                delete allScokets[user.id];
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

            socket.on('flip-argument-trimmed-status', function (data) {
                var argumentID = data._id;
                Argument.findOne({_id: argumentID}, function(err, argument) {
                    if (err){
                        throw err;
                    }
                    else{
                        argument.trimmed = !argument.trimmed;
                        argument.save(function (err) {
                            if (err){
                                throw err;
                            }
                            else{
                                argumentsNsp.to(argument.disc_id).emit('flip-argument-trimmed-status', {_id: argumentID});
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
                        var userInfo = "";
                        if(user)
                            userInfo = user.local.info;
                        argumentsNsp.to(discussionId).emit('sending-user-info', {userInfo:userInfo});
                    }
                });
            });

            socket.on('new-chat-message',function(chatMsg){

                Discussion.findById(discussionId, function(err, disc) {
                    if (err) throw err;
                    else {

                        if(user.id == disc.moderator_id)
                            chatMsg.role = 'moderator';

                        Chat.findByIdAndUpdate(disc.chat_id, {$push: {"messages":chatMsg}}, {new: true}, function(err, chat){
                            if(err) throw err;
                            argumentsNsp.to(discussionId).emit('sending-chat-message', chatMsg);
                        });
                    }
                });
            });
        }
    });

    return router;

};

