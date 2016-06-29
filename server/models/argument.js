var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var argumentScheme = mongoose.Schema({
	disc_id: {type:Schema.Types.ObjectId, ref: 'Discussion'},
	parent_id: {type:Number, ref: 'Argument'},
	main_thread_id: {type:Number, ref:'Argument'},
	user_id: {type:Schema.Types.ObjectId, ref: 'User'},
	username: String,
	role: String,
	fname: String,
	lname: String,
	content: String,
	depth: Number,
	sub_arguments: [{type:Number, ref: 'Argument'}],
	update_field: String //used for updating the timestamp of the document from mongoose. Not used for any other logic..

},{
	timestamps:true
});

module.exports = function(autoIncrement){
	argumentScheme.plugin(autoIncrement.plugin, 
	{
		model:'Argument',
		startAt: 1
	});
	return mongoose.model('Argument', argumentScheme);
};