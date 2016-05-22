module.exports = function(autoIncrement){

  var Discussion = require('../models/discussion');
  var Argument = require('../models/argument')(autoIncrement);
    
  var express = require('express');
  var router = express.Router();

  /* DISCUSSIONS API */
  //get all the discussions
  router.get('/discussions', function(req, res, next) {
    Discussion.find({isActive:true}, function(err, data){
      res.json(data);
    });
  });

  //post a new discussion
  router.post('/discussions', function(req, res){
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
  router.delete('/discussions/:id', function(req, res, next){
    //I think that discussions should not be totaly 'removed' from database, 
    //but rather be assigned as not-active by appropriate field in the document
                /*Discussion.remove({_id: req.params.id}, function(err, data){
                  res.json({result: err ? 'error' : 'ok'});
                });*/
    var id = req.params.id;
    Discussion.findByIdAndUpdate(id, {$set: {isActive: false}}, function(err, disc){
      // console.log(disc);
      res.json({result: err ? 'error' : 'ok'});
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
      res.json(disc);
    });
  });


  /* ARGUMENTS API */
  router.get('/discussions/:id/:discussionName', function(req, res, next){
    var id = req.params.id;
    Argument.find({disc_id: id}, function(err, discArguments){
      if (err){
        return next(err);
      }
      if(!discArguments){
        return res.status(404).json({
          message: 'Discussion with id ' + id + ' can not be found.'
        });
      }
      res.json(discArguments);
    });
  });

  router.post('/discussions/:id/:discussionName', function(req, res, next){
    var id = req.params.id;
    var argument = new Argument();

    console.log(req.body);

    argument.disc_id = id;
    argument.parent_id = (req.body.parent_id ? req.body.parent_id : 0);
    argument.user_id = req.user._id;
    argument.username = req.user.local.username;
    argument.content = req.body.content;
    argument.depth = (req.body.depth ? req.body.depth : 0);
    argument.sub_arguments = [];

    //TODO: add the incoming reply to the array of sub_arguments of the parent

    argument.save(function(err, data){
      if (err)
        throw err;
      res.json(data); //send the json back to the client, after saved in the database
    });
  });

  return router;

};

