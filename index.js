var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile('index.html', { root: __dirname });
});


var clients = [];
io.on('connection', function(socket){

	//add a client to our array with empty name and color fields
	clients.push({id: socket.id, name: 'tmp', color: '#000'});
	//push the id to the client, so they can respond with their color and name
	io.sockets.connected[socket.id].emit('set id', socket.id);
	//client response - set their color and name, and then emit to all clients to update user list
	socket.on('connection message', function(msg){
		var index = searchId(socket.id)
		console.log(index);
		if (index > -1) {
			clients[index].name = msg.name;
			clients[index].color = msg.color;
    		io.emit('connection message', msg, clients);
    	}
	});

	//simple emit to all clients
	socket.on('chat message', function(name, msg){
    	io.emit('chat message', name, msg);
	});

	//on disconnect remove them from our array of clients and have all clients rebuild their user list
	socket.on('disconnect', function(){
		var index = searchId(socket.id);
		if (index > -1) {
			var dc = {name: clients[index].name, color: clients[index].color};
			clients.splice(index, 1);
			console.log(socket.id + ' disconnected');
			io.emit('disconnect message', dc, clients);
		}
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

function searchId(sid){
	for (var i=0; i<clients.length; i++){
		if (clients[i].id === sid)
			return i;
	}
	return -1;
}

app.use("/js", express.static(__dirname + '/js'));
app.use("/styles", express.static(__dirname + '/styles'));