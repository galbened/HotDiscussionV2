var mongoose = require('mongoose');

var discussionScheme = mongoose.Schema({
	title: String,
	description: String,
	restriction: String //["student", "instructor", "none"]
});

module.exports = mongoose.model('Discussion', discussionScheme);