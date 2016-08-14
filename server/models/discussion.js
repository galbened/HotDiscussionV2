var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var discussionScheme = mongoose.Schema({
	title: String,
	description: String,
	restriction: String, //["student", "instructor", "none"]
	moderator_id: {type:Schema.Types.ObjectId, ref: 'User'},
	moderator_fname: String,
	moderator_lname: String,
	permittedPoster_id: {type:Schema.Types.ObjectId, ref: 'User'},
	permittedPoster_fname: String,
	permittedPoster_lname: String
});

module.exports = mongoose.model('Discussion', discussionScheme);