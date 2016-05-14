module.exports = function(isLoggedIn){
    
  var express = require('express');
  var router = express.Router();

  /* SHOW THE DISCUSSIONS THREADS */

  router.get('/', isLoggedIn, function(req, res, next) {
    res.render('discussions', {user: req.user});
  });

  router.get('/:id/:title/:description', isLoggedIn, function(req, res, next){
    res.render('threads', {title: req.params.title, description: req.params.description});
  });

  return router;
    
};

//module.exports = router;