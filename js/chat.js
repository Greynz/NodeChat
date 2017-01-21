var socket = io();
var myColor = ['#158178','#6036da','#6e368f','#f73c59','#6a6832','#511583','#436b34','#2e0106','#596466','#f7492b','#468db0','#c15a1f','#594b04','#4a739a','#41682a','#0d4c30'][Math.floor(Math.random()*16)];
var sendButton = $('#sendButton');
var msgBox = $('#messageBox');
var users = $('#users');
var nameField = $('#name').val(['Bobbert','Tommert','Ralphert','Larimous','Dannert','Babush','The Catfish is the King of the Pontar','Sammert','Frankert','Robbert','Smithert','Seannert','Kevert','Jeremert','Mikert','Jonert'][Math.floor(Math.random()*16)]);
var myId;


socket.on('set id', function(id){
	myId = id;
	console.log(myId);
	socket.emit('connection message', 	{ 	color:myColor, 
											name:nameField.val(), 
											msg:' has connected to the server!', 
											id: myId });
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

socket.on('connection message', function(msg, clients){
	rebuildUserList(clients);
	var item = $('<li/>').addClass('connection');
	var uname = $('<p/>').addClass('name').text(msg.name).appendTo(item).css("color", msg.color);
	var message = $('<p/>').addClass('connectiontext').text(msg.msg).appendTo(item);
	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});

socket.on('disconnect message', function(dc, clients){
	rebuildUserList(clients);
	var item = $('<li/>').addClass('disconnect');
	var uname = $('<p/>').addClass('name').text(dc.name).appendTo(item).css("color", dc.color);
	var message = $('<p/>').addClass('disconnecttext').text(' has disconnected!').appendTo(item);
	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});

function rebuildUserList(clients){
	users.empty();
	for (var i in clients){
		console.log(clients[i].name);
		users.append($('<p/>').text(clients[i].name));
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

sendButton.click(function(){
	sendMessage();
});

msgBox.keydown(function(e){
	if(e.keyCode == 13) {
		sendMessage();
	}
});

function sendMessage() {
	var msg = msgBox.val();
	var name = {name:$('#name').val(), color:myColor};
	if (msg !== '') {
		socket.emit('chat message', name, msg);
		msgBox.val('');
	}
}

socket.on('chat message', function(name, msg){
	var item = $('<li/>');
	var message = $('<p/>').addClass('text').appendTo(item);
	var uname = $('<span/>').addClass('name').text(name.name+':').appendTo(message).css("color", name.color);
	message.append(msg);

	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


