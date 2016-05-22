var mongoose = require('mongoose');

var discussionScheme = mongoose.Schema({
	title: String,
	description: String,
	isActive: Boolean
});

module.exports = mongoose.model('Discussion', discussionScheme);