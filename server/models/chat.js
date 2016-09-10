var mongoose = require('mongoose');

var chatScheme = mongoose.Schema({
    messages: [{name:String,role:String,body:String}]
});

module.exports = mongoose.model('Chat', chatScheme);