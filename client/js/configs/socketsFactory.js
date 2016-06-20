(function () {
  angular.module('socketio.factory', [])
  .factory("socketio", ['socketFactory', function (socketFactory) {
    // var discussionSocket = io('/discussions', {query: {discussion: d}});
    // var argumentsSocket = io('/arguments');
    return {
    	discussions: function(){
    		return socketFactory({ioSocket: io('/discussions')});
    	},
    	arguments: function(options){
    		if (options){
    			return socketFactory({ioSocket: io('/arguments', {query: {discussion: options.discussion}})});
    		}
    		return socketFactory({ioSocket: io('/arguments')});
    	}
    };
  }]);
})();

