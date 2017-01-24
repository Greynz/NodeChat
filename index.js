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
		if (index > -1) {
			clients[index].name = msg.name;
			clients[index].color = msg.color;
    		io.emit('connection message', msg, clients);
    	}
    	console.log(clients[index].name + ' has connected');
	});

	//name change
	socket.on('name change', function(msg){
		if (searchName(msg.name) === -1){
			var i = searchId(msg.id)
			if (i > -1) {
				var oldname = clients[i].name;
				clients[i].name = msg.name;
				console.log(oldname + ' changed names to ' + msg.name);
				io.emit('name change', clients, {old: oldname, new: msg.name});
				io.sockets.connected[msg.id].emit('change name', msg.name );
			}
		}
		else {
			io.sockets.connected[msg.id].emit('error message', {msg: 'The name '+msg.name+' is already taken'});
			var i = searchId(msg.id)
			if (i > -1)
				io.sockets.connected[msg.id].emit('change name', clients[i].name );
		}
	});

	//Chat message parses for commands, currently only supports whispers
	socket.on('chat message', function(msg){

    	var cmd = msg.msg.match(/(\/. )([^\s]+)(.*)/);
    	if (cmd){
	    	if (cmd[1] == '/w '){
    			var index = searchName(cmd[2]);
    			if (index > -1 && io.sockets.connected[clients[index].id]){
    				io.sockets.connected[msg.from].emit('whisper message', { name: 'To '+cmd[2], msg: cmd[3], received: false });
    				io.sockets.connected[clients[index].id].emit('whisper message', { name: msg.name, msg: cmd[3], received: true });
    			}
    		}
    	}
    	else {
    		//emits to all clients but the sending client
			for (var i=0; i<clients.length; i++)
				if (clients[i].id != msg.id && io.sockets.connected[clients[i].id])
	    			io.sockets.connected[clients[i].id].emit('chat message', msg);
    	}
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

function searchName(name){
	for (var i=0; i<clients.length; i++){
		if (clients[i].name === name)
			return i;
	}
	return -1;
}

app.use("/js", express.static(__dirname + '/js'));
app.use("/styles", express.static(__dirname + '/styles'));