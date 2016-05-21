// dependencies
var express = require('express');
var passport = require('passport');
var app = express();

//DB configurations
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.users_url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error'));
db.once('open', function(){console.log('succefully connected to mongodb');});

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);

require('./middleware')(app, express, passport);

require('./routes/routes')(app, passport, autoIncrement);

require('./server_critic_error_handlers').handleerror(app);

module.exports = app;