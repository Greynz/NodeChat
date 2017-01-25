function ChatController(ioIn, clientsIn) {
  io = ioIn;
  clients = clientsIn
};

ChatController.prototype.test = function test() {
  console.log('test test test');
};


//client response - set their color and name, and then emit to all clients to update user list
ChatController.prototype.connectionMessage = function connectionMessage(msg, socket) {
  var index = searchId(socket.id)
  if (index > -1) {
    clients[index].name = msg.name;
    clients[index].color = msg.color;
      io.emit('connection message', msg, clients);
    }
  console.log(clients[index].name + ' has connected');
};

//name change
ChatController.prototype.nameChange = function nameChange(msg) {
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
};

//Chat message parses for commands, currently only supports whispers
ChatController.prototype.chatMessage = function chatMessage(msg){
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
};

//on disconnect remove them from our array of clients and have all clients rebuild their user list
ChatController.prototype.disconnect = function disconnect(socket) {
  var index = searchId(socket.id);
  if (index > -1) {
    var dc = {name: clients[index].name, color: clients[index].color};
    clients.splice(index, 1);
    console.log(socket.id + ' disconnected');
    io.emit('disconnect message', dc, clients);
  }
};


//helpers
function searchId(sid){
  for (var i=0; i<clients.length; i++){
    if (clients[i].id === sid)
      return i;
  }
  return -1;
};

function searchName(name){
  for (var i=0; i<clients.length; i++){
    if (clients[i].name === name)
      return i;
  }
  return -1;
};

module.exports = ChatController;