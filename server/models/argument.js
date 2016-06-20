var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var argumentScheme = mongoose.Schema({
	disc_id: {type:Schema.Types.ObjectId, ref: 'Discussion'},
	parent_id: {type:Number, ref: 'Argument'},
	main_thread_id: {type:Number, ref:'Argument'},
	user_id: {type:Schema.Types.ObjectId, ref: 'User'},
	username: String,
	content: String,
	depth: Number,
	sub_arguments: [{type:Number, ref: 'Argument'}]

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