var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pmScheme = mongoose.Schema({
    sender_id: {type:Schema.Types.ObjectId, ref: 'User'},
    receiver_id: {type:Schema.Types.ObjectId, ref: 'User'},
    body: String,
    isRead: Boolean,
    previousMsg_id: {type:Schema.Types.ObjectId, ref: 'Pm'}
},{
    timestamps:true
});

module.exports = mongoose.model('Pm', pmScheme);