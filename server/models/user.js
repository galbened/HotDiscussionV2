var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userScheme = mongoose.Schema({
	local: {
		username: String,
		password: String,
		firstname: String,
		email: String,
		lastname: String,
		color: String,
		info: String,
		unreadMessages: [{type:Schema.Types.ObjectId, ref: 'Pm'}],
		role: String,
		code: String
	}
});

module.exports = mongoose.model('User', userScheme);