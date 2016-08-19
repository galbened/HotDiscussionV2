var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

module.exports = function(passport){

	passport.serializeUser(function(user, done){
		done(null, {id: user._id, username: user.local.username, fname: user.local.firstname, lname: user.local.lastname, color: user.local.color, role:user.local.role});
	});

	passport.deserializeUser(function(userContext, done){
		User.findById(userContext.id, function(err, user){
			done(err, user);
		});
	});

	//TODO: serialize with the role! maybe play with express-session stuff...

	passport.use('local-register', new LocalStrategy({
			//the names of the fields in the POST body to the server are default: username, password (the primary ones). TO PAY ATTENTION
			passReqToCallback: true
		},
		function(req, username, password, done){
			process.nextTick(function(){
				User.findOne({'local.username':username}, function(err, user){
					if (err){
						return done(err);
					}
					if (user){
						return done(null, false, req.flash('registerMessage', 'That username is already taken'));
					}else{

						function getRandomColor() {
							var letters = '0123456789ABCDEF'.split('');
							var color = '#';
							for (var i = 0; i < 6; i++ ) {
								color += letters[Math.floor(Math.random() * 16)];
							}
							return color;
						}

						var newUser = new User();
						newUser.local.username = username;
						newUser.local.password = bcrypt.hashSync(password);
						newUser.local.firstname = req.body.fname;
						newUser.local.lastname = req.body.lname;
						newUser.local.color = getRandomColor();
						// newUser.local.role = "student";

						newUser.save(function(err){
							if (err){
								throw err;
							}else{
								return done(null, newUser);
							}
						});
					}
				});
			});
		}));

	passport.use('local-login', new LocalStrategy(
		function(username, password, done){
            console.log('using the strategy.. [username: ' + username + '], [password: ' + password + ']');
			process.nextTick(function(){
				User.findOne({'local.username':username}, function(err, user){
					if (err){
                        console.log('error in done callback1');
						return done(err);
					}
					if (!user){
                        console.log('NO USER. to done callback2');
						return done(null, false, {message: 'Invalid Username!'})
					}if((user.local.password !== password)&&(!bcrypt.compareSync(password, user.local.password))){
                        console.log('BAD PASSWORD in done callback3');
						return done(null, false, {message: 'Invalid Password!'});
					}
					return done(null, user);
				});
			});
		}));
};