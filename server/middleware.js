var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');

//DB configurations
var configDB = require('./config/database.js');
mongoose.connect(configDB.users_url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error'));
db.once('open', function(){console.log('succefully connected to mongodb')});

module.exports = function(app, express, passport){

  require('./config/passport')(passport);

  // create application/json parser
  var jsonParser = bodyParser.json();
  // create application/x-www-form-urlencoded parser
  var urlencodedParser = bodyParser.urlencoded({ extended: false });

  app.use(logger('dev'));
  //app.use(cookieParser());
  //TODO: consider expiration for sessions. i.e.: req.session.coockie.maxAge = XXX...
  app.use(urlencodedParser);// we send simple strings here...
  app.use(jsonParser);// we send simple strings here...
  app.use(session({
    secret: 'hsfjvhwuejhksjoviskjdheu',
    saveUninitialized: true,
    resave: true
  }));
  app.use(passport.initialize()); 
  app.use(passport.session());// uses the same session from express
  app.use(flash());

  //TODO: save the sessions in the database
  //TODO: agree with BARUCH how to manage the students in the discussions. Now it is basic authentication
  app.use(express.static(path.resolve(__dirname, '..', 'client')));

  // view engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.resolve(__dirname, '..', 'client', 'views'));
};