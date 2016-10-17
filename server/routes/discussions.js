module.exports = function(isLoggedIn){
    
  var express = require('express');
  var router = express.Router();

  var Discussion = require('../models/discussion');
  var usersGroup = require('../models/users_group');

  var isUserInDiscussionGroup = function(discussion_id,user,next){
    Discussion.findById(discussion_id,function(err,disc){
      usersGroup.findById(disc.users_group_id,function(err,group){
        next((group == null) || ((group.users.indexOf(user.id))!=-1) || (user.local.role=='admin'));
      })
    })
  };

  /* SHOW THE DISCUSSIONS THREADS */

  router.get('/', isLoggedIn, function(req, res, next) {
    var user = req.session.passport.user;
    res.render('discussions', {user: user});
  });

  router.get('/:id/:title/:description', isLoggedIn, function(req, res, next){

    isUserInDiscussionGroup(req.params.id,req.user, function(flag){
      if(flag)
        res.render('threads', {title: req.params.title, description: req.params.description});
      else {
        var event = new Date().toLocaleString();
        console.log(req.user.local.username + ' has entered an unauthorized page without permission! ' + '[' + event + ']');
        req.logout();
        res.redirect('/auth/login');
      }
    });
  });

  return router;
    
};

//module.exports = router;