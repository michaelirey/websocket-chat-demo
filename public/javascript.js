function get_current_time(){
	var time = new Date();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	if (minutes < 10){
		minutes = "0" + minutes
	}
	if (hours == 0) {
		return '12:' + minutes + 'am';
	}
	if (hours < 12) {
		return hours + ':' + minutes + 'am';
	} else {
		return (hours - 12) + ':' + minutes + 'pm';
	}
}

var EvantaChat = {
	
	init: function(){
		if (typeof WebSocket === 'undefined') {
	    	alert("Your browser does not support websockets.")
			return false;
	    }
		EvantaChat.init_websocket();
		$('#chatroom').hide();
		EvantaChat.wait_for_join();
		EvantaChat.wait_for_chat_submit();
	},
	
	init_websocket: function(){
		var ws =  new WebSocket('ws://10.116.100.86:8100'); //andrew's computer
		ws.onopen = function(){};
		ws.onclose = function(){
			EvantaChat.display_status('You have been disconnected');
		};
		ws.onmessage = function(evt){
			var data = JSON.parse(evt.data);
			EvantaChat.message_received(data.type, data.username, data.message);
		};
		EvantaChat.ws = ws;
	},
	
	wait_for_join: function(){
		$('#username').keyup(function (event) {
			if (event.keyCode == 13) { // The enter key.
				EvantaChat.join_chat();
			}
	    });
		$('#join').click(function(){
			EvantaChat.join_chat();
		});
	},
	
	wait_for_chat_submit: function(){
		var keyboard = $("#keyboard");
	    keyboard.keyup(function (event) {
	      if (event.keyCode == 13) { // The enter key.
			EvantaChat.send_json('message', keyboard.val());
	        keyboard.val('');
	      }
	    });
	},
	
	join_chat: function(){
		var username = $.trim($('#username').val());
		if (username.length == 0) {
			alert('Please enter your name.');
			return false;
		}
		EvantaChat.username = username;
		EvantaChat.send_json('join');
		$('#pick_a_username').hide();
		$('#chatroom').show();
	},
	
	message_received: function(type, username, message, time){
		if (type == 'status') {
			EvantaChat.display_status(message, time);
		} else {
			EvantaChat.display_message(username, message, time);
		}
		EvantaChat.scroll_to_bottom_of_chat();
	},
	
	display_status: function(message){
		$("#messages").append("<p class='debug'>" + message + "<time>" + get_current_time() + "</time></p>");
	},
	
	display_message: function(username, message){
		$("#messages").append("<p><strong>" + username + ":</strong> " + message + "<time>" + get_current_time() + "</time></p>");
	},
	
	scroll_to_bottom_of_chat: function(){
		$("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
	},
	
	send_json: function(type, msg){
		var json = { type: type, username: EvantaChat.username, message: msg };
		EvantaChat.ws.send(JSON.stringify(json));
	}
};

$(document).ready(function(){
	EvantaChat.init();
});
