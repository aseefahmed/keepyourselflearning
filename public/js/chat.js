var socket = io();
var chatForm = document.forms.chatForm;
var color = getRandomColor();
function getRandomColor() {
		  var letters = '0123456789ABCDEF';
		  var color = '#';
		  for (var i = 0; i < 6; i++) {
		    color += letters[Math.floor(Math.random() * 16)];
		  }
		  return color;
		}
socket.on('connect', function(){
	if(chatForm){
		
			


		$('#chat-submit').click(function(e){
			e.preventDefault();
			var chatUsername = $('#chat-username').val();
			var chatMessage = $('#chat-message').val();
			socket.emit('postMessage', {
				username: chatUsername,
				message: chatMessage,
				color: color
			});
			$('#chat-message').val('');
			$('#chat-message').focus();
		})

		socket.on('updateMessage', function(data){
			showMessage(data);
		});

		function showMessage(data){
			var stl = "padding: 20px;background-color:"+data.color+"; color:#000;";

			$('.chat-display').append("<p style='"+stl+"'>"+data.username+': '+data.message+'</p>')
		}

		
	}
})
