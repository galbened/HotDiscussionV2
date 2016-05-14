var mongoose = require('mongoose');

var userScheme = mongoose.Schema({
	local: {
		username: String,
		password: String,
		firstname: String,
		lastname: String,
		role: String
	}
});

module.exports = mongoose.model('User', userScheme);