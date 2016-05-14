// dependencies
var express = require('express');
var passport = require('passport');
var app = express();

require('./middleware')(app, express, passport);

require('./routes/routes')(app, passport);

require('./server_critic_error_handlers').handleerror(app);

module.exports = app;