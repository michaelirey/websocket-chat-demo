require "bundler"
Bundler.setup
require 'em-websocket'
require 'json'

class ChatMessage
  
  attr_accessor :type, :username, :message
  
  def initialize(msg_json, time_received)
    msg = JSON.parse(msg_json)
    @type = msg['type']
    @username = msg['username']
    @message = msg['message']
  end
  
  def is_join?
    @type == 'join'
  end
  
  def name_change?
    /^\/nick .*/
  end
  
  def new_username
    @message.gsub(/^\/nick/, '')
  end
  
  def to_s
    if is_join?
      return {:type => 'status', :message => "#{@username} has joined the chatroom"}.to_json
    elsif name_change?
      return {:type => 'status', :message => "#{@username} is now known as #{new_username}"}.to_json
    else
      # case @message
      #       when /^\/nick .*/
      #         return {:type => 'status', :message => "#{@username} is now known as #{new_username}"}.to_json
      #       else
        return {:type => 'message', :username => @username, :message => @message}.to_json
      end
    end
  end
end

EventMachine.run do
  
  @main_channel = EventMachine::Channel.new
  @subscribers = []
  
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8100) do |ws|
    
    ws.onopen do
      
      subscriber_id = @main_channel.subscribe do |msg|
        ws.send(msg) #main send method, gets called when @main_channel.push gets called
      end
      
      ws.onclose do
        @main_channel.push ({:type => 'status', :message => "#{@subscribers[subscriber_id]} has left the chatroom"}.to_json)
        @main_channel.unsubscribe(subscriber_id)
      end
    
      ws.onmessage do |msg_json|
        message = ChatMessage.new(msg_json, Time.now)
        if (message.is_join?)
          @subscribers[subscriber_id] = message.username
        end
        if (message.name_change?)
          @subscribers[subscriber_id] = message.new_username
        end
        @main_channel.push message.to_s
      end
      
    end
    
  end
  
  puts "WebSocket server started at ws://0.0.0.0:8100"
  
end