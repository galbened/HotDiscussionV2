(function () {
  angular.module('socketio.factory', [])
  .factory("socketio", ['socketFactory', function (socketFactory) {
    var discussionSocket = io.connect('/discussions');
    var argumentsSocket = io.connect('/arguments');
    return {
    	discussions: function(){return socketFactory({ioSocket: discussionSocket});},
    	arguments: function(){return socketFactory({ioSocket: argumentsSocket});}
    };
  }]);
})();

