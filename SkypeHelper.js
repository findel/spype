var util = require("util");
var fs = require('fs');
var toMarkdown = require('to-markdown');

var config = JSON.parse(fs.readFileSync("config.json"));
var pipes = require("./PipesHelper");
var SkywebClient = require('skyweb');

var SkypeHelper = 
{
	skyweb : new SkywebClient(),
	isConnected : false,
	debug : false,
	converters : 
	[
		{
			filter: ['a', 'ss', 'quote', 'legacyquote'],
			replacement: function(content) { return content; }
		},
		{
			filter: "pre",
			replacement: function(content) { return "`" + content + "`"; }
		},
		{
			filter: "uriobject",
			replacement: function(content) { return "` Shared something on skype that can't be shared elsewhere! :-( `"; }
		}
	],
	Connect : function()
	{
		console.log("\nConnecting Skype...");
		try
		{
			this.skyweb.login(config.skype_username, config.skype_password).then((skypeAccount) => 
			{    
				console.log("\n * Skype connected.")
				SkypeHelper.skyweb.setStatus('Online');
				SkypeHelper.isConnected = true;
				pipes.each(function(pipe)
				{
					if(pipe.announceConnection)
						SkypeHelper.SendMessage(pipe, "Reconnected", "SPYPE");
				});
			});	
			this.skyweb.messagesCallback = SkypeHelper.skypeMessagesReceived;
		}
		catch(err)
		{
			console.log("SkypeHelper.Connect() error: ");
			console.log(err);
			this.isConnected = false;
		}
	},
	SendMessage : function(pipe, message, sender)
	{
		var skypeMessage = "";

		//if(pipe.lastSkypeSender != null)
			//skypeMessage += "\n";

		if(sender != null && sender != pipe.lastSkypeSender)
			skypeMessage += util.format("[%s]\n", sender);
		
		skypeMessage += message;
		
		console.log("\nSKYPE: (" + pipe.name + ") " + skypeMessage);
		
		if(SkypeHelper.isConnected)
		{
			try
			{
				SkypeHelper.skyweb.sendMessage(pipe.skypeId, skypeMessage);
				pipe.lastSkypeSender = sender;	
				console.log("SENT!");
			}
			catch(err)
			{
				console.log("FAILED! Error:");
				console.log(err)
			}
		}
		else
		{
			console.log("FAILED! Skype is not connected.");
		}
	},
	Callbacks : [],
	MessageCallback : function(callback)
	{
		this.Callbacks.push(callback);
	},
	skypeMessagesReceived : function(messages)
	{
		messages.forEach(function (message) 
		{
			var spypeIsNotSender = (message.resource.from.toLowerCase().indexOf(config.skype_username.toLowerCase()) === -1);
			if(spypeIsNotSender && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping')
			{
				var conversationLink = message.resource.conversationLink;
				var conversationId = conversationLink.substring(conversationLink.lastIndexOf('/') + 1);
				var pipe = pipes.getPipe({ skypeId: conversationId });
				if(pipe != null)
				{
					// Skype message received, clear lastSkypeSender
					pipe.lastSkypeSender = null;
					// Output received object (testing)
					if(SkypeHelper.debug)
					{
						console.log("\nRECEIVED IN SKYPE");
						console.log(message);
					}
					// Clean up message from skype (remove code etc)
					var cleanMessage = toMarkdown(message.resource.content, { converters: SkypeHelper.converters });
					// Send to callbacks
					var userName = message.resource.imdisplayname;
					for(var i = 0; i < SkypeHelper.Callbacks.length; i++)
					{
						SkypeHelper.Callbacks[i](pipe, cleanMessage, userName);
					}
				}
			}
		});
	}
}

module.exports = SkypeHelper;