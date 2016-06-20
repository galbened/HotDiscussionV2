var mongoose = require('mongoose');

var discussionScheme = mongoose.Schema({
	title: String,
	description: String,
	restriction: String
});

module.exports = mongoose.model('Discussion', discussionScheme);