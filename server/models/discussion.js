var mongoose = require('mongoose');

var discussionScheme = mongoose.Schema({
	title: String,
	description: String
});

module.exports = mongoose.model('Discussion', discussionScheme);