Skyweb = require('skyweb');
DiscordClient = require('discord.io');

var util = require("util");
var toMarkdown = require('to-markdown');
var skyweb = new Skyweb();
var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));
var markdown = require("markdown").markdown;

var PipesHelper = require("./PipesHelper");
var EditMessageHelper = require("./EditMessageHelper");
var pipes = new PipesHelper(config);
var editHelper = new EditMessageHelper();

var debug = process.argv[2] == "debug" ? true : false;

var skypeConnected = false;
var discordConnected = false;

var discord = new DiscordClient({
    autorun: true,
    email: config.discord_email,
    password: config.discord_password
});

var skypeConverters = 
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
]

var sendSkypeMessage = function(pipe, message, sender)
{
	var skypeMessage = "";

	//if(pipe.lastSkypeSender != null)
		//skypeMessage += "\n";

	if(sender != null && sender != pipe.lastSkypeSender)
		skypeMessage += util.format("[%s]\n", sender);
	
	skypeMessage += message;
	
	console.log("\nSKYPE (" + pipe.name + ") " + skypeMessage);
	
	if(skypeConnected)
	{
		skyweb.sendMessage(pipe.skypeId, skypeMessage);
		pipe.lastSkypeSender = sender;	
		console.log("SENT!");
	}
	else
	{
		console.log("FAILED! Skype is not connected.");
	}
}

// SET UP PIPES AND SAY SO
pipes.setup();

var sendDiscordMessage = function(pipe, message, sender)
{	
	var discordMessage = "";
	
	//if(pipe.lastDiscordSender != null)
		//discordMessage += "\n";
	
	if(sender != null && sender != pipe.lastDiscordSender)
		discordMessage += util.format("**[%s]**\n", sender);

	discordMessage += message;
	
	console.log("\nDISCORD: (" + pipe.name + ") " + discordMessage);
	
	if(discordConnected)
	{
		discord.sendMessage({ to: pipe.discordId, message: discordMessage, tts: false, typing: false}, function(err, response){
			if(debug)
			{
				console.log("\nSENT TO DISCORD:");
				console.log(response);
			}
		});
		pipe.lastDiscordSender = sender;
		console.log("SENT!");
	}
	else
	{
		console.log("FAILED! Discord is not connected.");
	}
}

skyweb.login(config.skype_username, config.skype_password).then((skypeAccount) => 
{    
	console.log("Skype connected.")
	skyweb.setStatus('Online');
	skypeConnected = true;
	pipes.each(function(pipe)
	{
		sendSkypeMessage(pipe, "Reconnected", "SPYPE");
	});
});

discord.on('ready', function() {
    console.log("Discord connected.")
	discordConnected = true;
	pipes.each(function(pipe)
	{
		sendDiscordMessage(pipe, "Reconnected", "SPYPE");
	});
});

skyweb.messagesCallback = function (messages)
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
				if(debug)
				{
					console.log("\nRECEIVED IN SKYPE");
					console.log(message);
				}
				// Clean up message from skype (remove code etc)
				var cleanMessage = toMarkdown(message.resource.content, { converters: skypeConverters });
				// Send to Discord
				sendDiscordMessage(pipe, cleanMessage, message.resource.imdisplayname);
			}
        }
    });
};
 
discord.on('message', function(user, userID, channelID, message, rawEvent) {
	if(user != config.discord_username)
	{
		var pipe = pipes.getPipe({ discordId: channelID });
		if(pipe != null)
		{
			// Discord message received, clear lastDiscordSender
			pipe.lastDiscordSender = null;
			// Output received object (testing)
			if(debug)
			{
				console.log("\nRECEIVED IN DISCORD");
				console.log(rawEvent);
			}
			// Clean up message from discord (remove @User encoding)
			var cleanMessage = discord.fixMessage(message);
			// Send to Skype
			sendSkypeMessage(pipe, cleanMessage, user);
		}
	}
});

discord.on('debug', function(rawEvent) {
	if(rawEvent.t == "MESSAGE_UPDATE")
	{
		var channelId = rawEvent.d.channel_id;
		var user = rawEvent.d.author.username;
		var message = rawEvent.d.content;
		var messageId = rawEvent.d.id;
		
		var pipe = pipes.getPipe({ discordId: channelId });
		if(pipe != null)
		{
			// Output received object (testing)
			if(debug)
			{
				console.log("\nMESSAGE_UPDATE IN DISCORD");
				console.log(rawEvent);
			}
			// Clean up message from discord (remove @User encoding)
			var cleanMessage = discord.fixMessage(message);
			// TODO: EDIT IN SKYPE (below doesn't work yet)
			editHelper.editMessage(pipe, message, { discordMessageId: messageId })
		}
	}
	else if(rawEvent.t == "MESSAGE_DELETE")
	{
		var channelId = rawEvent.d.channel_id;
		var messageId = rawEvent.d.id;
		
		var pipe = pipes.getPipe({ discordId: channelId });
		if(pipe != null)
		{
			// Output received object (testing)
			if(debug)
			{
				console.log("\nMESSAGE_DELETE IN DISCORD");
				console.log(rawEvent);
			}
			// TODO: DELETE IN SKYPE (below doesn't work yet)
			editHelper.deleteMessage(pipe, { discordMessageId: messageId })
		}
	}
});

var sendDisconnectedMessages = function()
{
	pipes.each(function(pipe)
	{
		sendSkypeMessage(pipe, "Disconnected", "SPYPE");
		sendDiscordMessage(pipe, "Disconnected", "SPYPE");
	});
}

function exitHandler(options, err)
{
    try
	{
		if(options.sendDisconnect)
		{
			sendDisconnectedMessages();
		}
	}
	finally
	{
		if (err) console.log(err.stack);
		process.exit();
	}
}

if(process.platform === "win32")
{
	var rl = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on("SIGINT", function () {
		process.emit("SIGINT");
	});
}

//do something when app is closing
process.on('SIGHUP', function()
{
	console.log("SIGHUP");
	pipes.each(function(pipe)
	{
		sendSkypeMessage(pipe, "SIGHUP", "SPYPE");
		sendDiscordMessage(pipe, "SIGHUP", "SPYPE");
	});
});

//do something when app is closing
process.on('exit', exitHandler.bind(null,{sendDisconnect:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {sendDisconnect:true, exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
