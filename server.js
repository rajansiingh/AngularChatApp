var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var soc = [];
function send404(response) {
	response.writeHead(404, {
		'Content-Type' : 'text/plain'
	});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(200, {
		"content-type" : mime.lookup(path.basename(filePath))
	});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

var server = http.createServer(function(request, response) {
	var filePath = false;
	if (request.url == '/') {
		filePath = 'client/index.html';
	} else {
		filePath = 'client' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

var socketio = require('socket.io');
io = socketio.listen(server);
//io.set('log level', 1);
io.sockets.on('connection', function(socket) {

	soc[socket.id] = socket;

	console.log("- - -  connected : -> " + socket.id);

	socket.on('messageSend', function(obj) {
		socket.broadcast.emit('messageReceived', obj);
	});

	socket.on('getStatusUpdate', function() {
		var users = Object.keys(soc).length;
		io.sockets.emit('sendStatusUpdate', users);
	});

	socket.on('error', function(err) {
		console.log("error", err);
	});

	socket.on('connect_error', function(err) {
		console.log("connect_error", err);
	});

	socket.on('connect_timeout', function(err) {
		console.log("connect_timeout", err);
	});

	socket.on('reconnect', function(err) {
		console.log("reconnect", err);
	});

	socket.on('reconnect_error', function(err) {
		console.log("reconnect_error", err);
	});

	socket.on('disconnect', function(data) {
		delete soc[socket.id];
		var users = Object.keys(soc).length;
		io.sockets.emit('sendStatusUpdate', users);
		console.log("x x x  disconnect : -> " + socket.id);
	});

});
