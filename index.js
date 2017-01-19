var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket){
  socket.on('chat message', function(name, msg){
    io.emit('chat message', name, msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use("/js", express.static(__dirname + '/js'));
app.use("/styles", express.static(__dirname + '/styles'));