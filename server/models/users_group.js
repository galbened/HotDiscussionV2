var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var users_groupScheme = mongoose.Schema({
    name: String,
    body_prefix: String,
    users: [{type:Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Users_Group', users_groupScheme);