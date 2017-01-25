var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var Test = require('./controller.js');
var clients = [];
//var controller = new Test(io, clients);

var Controller = require('./control.js');
var controller = new Controller(io, clients);

controller.test();

app.use("/js", express.static(__dirname + '/js'));
app.use("/styles", express.static(__dirname + '/styles'));

app.get('/', function(req, res){
	res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket){

	//add a client to our array with empty name and color fields
	clients.push({id: socket.id, name: 'tmp', color: '#000'});
	//push the id to the client, so they can respond with their color and name
	io.sockets.connected[socket.id].emit('set id', socket.id);


  socket.on('connection message', function(msg){  controller.connectionMessage(msg, socket);  });
  socket.on('name change', function(msg){  controller.nameChange(msg);  });
  socket.on('chat message', function(msg){  controller.chatMessage(msg);  });
  socket.on('disconnect', function(msg){  controller.disconnect(socket);  });

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});