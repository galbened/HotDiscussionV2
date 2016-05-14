/**
 * Module dependencies.
 */
console.log('in boot...');
var app = require('./server/server.js');
var http = require('http');
var error_handlers = require('./server/server_critic_error_handlers');

/**
 * Get port from environment and store in Express.
 */
var port = error_handlers.normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
server.on('error', error_handlers.onError);
server.on('listening', error_handlers.onListening(server));

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, function(){
	console.log('server is running... PORT: ' + port);
});