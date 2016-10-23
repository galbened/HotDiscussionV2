function cloneArg(argSource,argTarget){
    argTarget.treeStructureUpdatedAt = argSource.treeStructureUpdatedAt;
    argTarget.disc_id = argSource.disc_id;
    argTarget.parent_id = argSource.parent_id;
    argTarget.main_thread_id = argSource.main_thread_id;
    argTarget.user_id = argSource.user_id;
    argTarget.username = argSource.username;
    argTarget.role = argSource.role;
    argTarget.fname = argSource.fname;
    argTarget.lname = argSource.lname;
    argTarget.color = argSource.color;
    argTarget.content = argSource.content;
    argTarget.depth = argSource.depth;
    argTarget.hidden = argSource.hidden;
    argTarget.trimmed = argSource.trimmed;

    argTarget.updatedAt = argSource.updatedAt;
    argTarget.createdAt = argSource.createdAt;

    argTarget.cloned = true;
}

var Chat;

function cloneDisc(discSource,discTarget){
    discTarget.title = discSource.title + ' copy';
    discTarget.description = discSource.description;
    discTarget.restriction = discSource.restriction;
    discTarget.moderator_id = discSource.moderator_id;
    discTarget.moderator_fname = discSource.moderator_fname;
    discTarget.moderator_lname = discSource.moderator_lname;
    discTarget.permittedPoster_id = discSource.permittedPoster_id;
    discTarget.permittedPoster_fname = discSource.permittedPoster_fname;
    discTarget.permittedPoster_lname = discSource.permittedPoster_lname;
    discTarget.content = discSource.content;
    discTarget.users_group_id = discSource.users_group_id;
    discTarget.locked = discSource.locked;

    discTarget.cloned = true;
}

module.exports = function(autoIncrement){

    var Argument = require('../models/argument')(autoIncrement);
    var Chat = require('../models/chat');
    var Discussion = require('../models/discussion');

    this.Chat = Chat;

    var discussionDeepCopy = function(disc_id, next) {

        Discussion.findOne({_id: disc_id}, function (err, disc) {
            if (err) {
                throw err;
            }
            else {
                var newDisc = new Discussion();
                cloneDisc(disc,newDisc);

                var chat = new Chat;
                newDisc.chat_id = chat._id;
                chat.save(function(){
                    newDisc.save(function(){
                        Argument.find({disc_id: disc_id}, function (err, discArguments) {
                            if (err) {
                                throw err;
                            }
                            else {
                                var argsMap = {};
                                var counter = 0;

                                discArguments.forEach(function(arg) {
                                    var newArg = new Argument();
                                    cloneArg(arg, newArg);
                                    newArg.disc_id = newDisc._id;
                                    newArg.save(function (err,data) {
                                        argsMap[arg._id] = data;
                                        counter++;

                                        if(counter == discArguments.length){
                                            counter = 0;
                                            discArguments.forEach(function(arg){
                                                if(arg.parent_id){
                                                    argsMap[arg._id].parent_id = argsMap[arg.parent_id]._id;
                                                }
                                                if(arg.main_thread_id){
                                                    argsMap[arg._id].main_thread_id = argsMap[arg.main_thread_id]._id;
                                                }
                                                argsMap[arg._id].save(function(){
                                                    counter++;
                                                    if(counter == discArguments.length){
                                                        next({newDisc:newDisc,args_count:counter});
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }
        });
    };

    return discussionDeepCopy;
};


