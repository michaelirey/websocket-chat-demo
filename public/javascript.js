function get_current_time(){
	var time = new Date();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var ampm = 'am';
	if (hours > 11) { ampm = 'pm'; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (hours == 0) { hours = 12; }
	if (hours > 12) { hours = hours - 12; }
	return hours + ':' + minutes + ampm;
}

var EvantaChat = {
	
	init: function(ws_host){
		if (typeof WebSocket === 'undefined') {
	    	alert("Your browser does not support websockets.")
			return false;
	    }
		EvantaChat.init_websocket(ws_host);
		$('#chatroom').hide();
		EvantaChat.wait_for_join();
		EvantaChat.wait_for_chat_submit();
	},
	
	init_websocket: function(ws_host){
		var ws =  new WebSocket(ws_host);
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
		$("#messages").append("<p>" + message + "<time>" + get_current_time() + "</time></p>");
	},
	
	scroll_to_bottom_of_chat: function(){
		$("#messages")[0].scrollTop = $("#messages")[0].scrollHeight;
	},
	
	send_json: function(type, msg){
		var json = { type: type, username: EvantaChat.username, message: msg };
		EvantaChat.ws.send(JSON.stringify(json));
	}
};
