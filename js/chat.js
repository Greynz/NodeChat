var socket = io();
var color = '#' + (function co(lor){   return (lor += [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)]) && (lor.length == 6) ?  lor : co(lor); })('');

var sendButton = $('#sendButton');
sendButton.click(function(){
	sendMessage();
});
var msgBox = $('#messageBox');
msgBox.keydown(function(e){
	if(e.keyCode == 13) {
		sendMessage();
	}
});

function sendMessage() {
	var msg = msgBox.val();
	var name = $('#name').val();
	if (msg !== '') {
		socket.emit('chat message', name, msg);
		msgBox.val('');
	}
}

socket.on('chat message', function(name, msg){
	var item = $('<li/>');
	var uname = $('<p/>').addClass('name').text(name+':').appendTo(item).css("color", color);
	var message = $('<p/>').addClass('text').text(msg).appendTo(item);

	$('#messages').append(item);
	$("html, body").animate({ scrollTop: $(document).height() }, "slow");
});