var socket = io();
var myColor = ['#2e455e','#327a6e','#327a40','#6d7a32','#7a5032','#892d2d','#892d69','#6f2d89','#3c2d89','#1676ad','#0d891c','#b59412','#b51242','#000000','#838c66','#004d4f'][Math.floor(Math.random()*16)];
var sendButton = $('#sendButton');
var msgBox = $('#messageBox');
var users = $('#users');
var nameField = $('#name').val(['Bobbert','Tommert','Ralphert','Larimous','Dannert','Babush','The Catfish is the King of the Pontar','Sammert','Frankert','Robbert','Smithert','Seannert','Kevert','Jeremert','Mikert','Jonert'][Math.floor(Math.random()*16)]);
var myName = $('#name').val();
var myId;


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Set id called by server

socket.on('set id', function(id){
	myId = id;
	console.log(myId);
	socket.emit('connection message', 	
			{ 	color:myColor, 
				name:nameField.val(), 
				msg:' has connected to the server!', 
				id: myId 
			});
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Name Change
//TODO need to make the server decide if name can be switched, not do it locally

nameField.keydown(function(e){
	if(e.keyCode == 13 && myName != $('#name').val()) {
		myName = $('#name').val();
		socket.emit('name change', {id: myId, name: myName});
	}
});

nameField.blur(function(){
	if (myName != $('#name').val()){
		myName = $('#name').val();
		socket.emit('name change', {id: myId, name: myName});
	}
})

socket.on('name change', function(clients, msg){
	rebuildUserList(clients);
	var item = $('<li/>').addClass('name-change');
	var message = $('<p/>').text(msg.old + ' has changed names to ' + msg.new);
	item.append(message);
	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, 0);
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Connection and Disconnection

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
		var button = $('<button/>').text(clients[i].name).addClass('btn btn-default userButton').css("color", clients[i].color);
		button.click(function(){
			msgBox.val('/w ' + $(this).text() + ' ');
			msgBox.focus();
		});
		var li = $('<li/>').append(button);
		users.append(li);
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Chat Messages

sendButton.click(function(){
	sendMessage();
});

msgBox.keydown(function(e){
	if(e.keyCode == 13) {
		sendMessage();
	}
});

function sendMessage() {
	var msg = { 
		msg: msgBox.val(), 
		name: $('#name').val(), 
		id: myId, 
		color: myColor 
	};

	var cmd = msg.msg.match(/(\/. )([^\s]+)(.*)/);

	if (msg.msg !== '') {
		msgBox.val('');
		if (!cmd)
			addChatMessage(msg, true);
		else if (cmd[1] === '/w '){
			msg.from = myId;
		}
		socket.emit('chat message', msg);
	}
}

socket.on('chat message', function(msg){
	addChatMessage(msg, false);
});

function addChatMessage(msg, selfMessage){
	var item = $('<li/>');
	if (selfMessage)
		item.addClass('selfText');
	var message = $('<p/>').addClass('text').appendTo(item);
	var uname = $('<span/>').addClass('name').text(msg.name+':').appendTo(message).css("color", msg.color);
	message.append(msg.msg);

	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ whipser receive

socket.on('whisper message', function(msg){
	var item = $('<li/>');
	if (msg.received) item.addClass('whisper');
	else item.addClass('selfWhisper');
	var message = $('<p/>').addClass('whispertext').appendTo(item);
	var uname = $('<span/>').addClass('name whispername');
	uname.text(msg.name+':');
	uname.appendTo(message);
	message.append(msg.msg);

	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ error message

socket.on('error message', function(msg){
	var item = $('<li/>').addClass('error');
	var message = $('<p/>').addClass('error').appendTo(item);
	message.append(msg.msg);
	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});
