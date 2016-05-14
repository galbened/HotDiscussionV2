var Discussion = require('../models/discussion');

module.exports = function(){
    
  var express = require('express');
  var router = express.Router();

  /* DISCUSSIONS API */
  //get all the discussions
  router.get('/discussions', function(req, res, next) {
    Discussion.find({}, function(err, data){
      res.json(data);
    });
  });

  //post a new discussion
  router.post('/discussions', function(req, res){
    console.log(req.body);
    var discussion = new Discussion();
    discussion.title = req.body.title;
    discussion.description = req.body.description;
    discussion.save(function(err, data){
      if (err)
        throw err;
      res.json(data); //send the json back to the client, after saved in the database
    });
  });

  //get a specific discussion
  router.get('/discussions/:id', function(req, res){
    Discussion.findOne({_id: req.params.id}, function(err, data){
      res.json(data);
    });
  });

  //delete a specific discussion
  router.delete('/discussions/:id', function(req, res){
    Discussion.remove({_id: req.params.id}, function(err, data){
      res.json({result: err ? 'error' : 'ok'});
    });
  });

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
      res.json(disc);
    });
  });

  return router;

};

