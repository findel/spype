Skyweb = require('skyweb');
DiscordClient = require('discord.io');

var util = require("util");
var toMarkdown = require('to-markdown');
var skyweb = new Skyweb();
var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));
var markdown = require("markdown").markdown;

var discord = new DiscordClient({
    autorun: true,
    email: config.discord_email,
    password: config.discord_password
});

var sendSkypeMessage = function(pipe, message)
{
	skyweb.sendMessage(pipe.skypeId, message);
	console.log("SKYPE (" + pipe.name + ") " + message);
}

var sendDiscordMessage = function(pipe, message)
{
	discord.sendMessage({
		to: pipe.discordId,
		message: message,
		tts: false, //Optional
		typing: false //Optional, client will act as if typing the message. Based on message length.
	});
	console.log("DISCORD: (" + pipe.name + ") " + message);
}

var sendDisconnectedMessages = function()
{
	config.pipes.forEach(function(pipe)
	{
		// sendSkypeMessage(pipe, "DISCONNECTED.");
		// sendDiscordMessage(pipe, "DISCONNECTED.");
	});
}

skyweb.login(config.skype_username, config.skype_password).then((skypeAccount) => 
{    
	console.log("Skype connected.")
	config.pipes.forEach(function(pipe)
	{
		// sendSkypeMessage(pipe, "CONNECTED");
	});
});

discord.on('ready', function() {
    console.log("Discord connected.")
	config.pipes.forEach(function(pipe)
	{
		// sendDiscordMessage(pipe, "CONNECTED");
	});
});

skyweb.messagesCallback = function (messages)
{
    messages.forEach(function (message) 
	{
		if(message.resource.from.indexOf(config.skype_username) === -1 && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping')
		{
			var conversationLink = message.resource.conversationLink;
			var conversationId = conversationLink.substring(conversationLink.lastIndexOf('/') + 1);
			config.pipes.forEach(function(pipe)
			{
				if(conversationId == pipe.skypeId)
				{
					var discordMessage = util.format("*[%s]* %s\n", message.resource.imdisplayname, toMarkdown(message.resource.content));
					sendDiscordMessage(pipe, discordMessage);
				}
			});
        }
    });
};
 
discord.on('message', function(user, userID, channelID, message, rawEvent) {
	if(user != config.discord_username)
	{
		config.pipes.forEach(function(pipe)
		{
			if(channelID == pipe.discordId)
			{
				var skypeMessage = util.format("[%s] %s\n", user, discord.fixMessage(message));
				sendSkypeMessage(pipe, skypeMessage);
			}
		});
	}
});

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
process.on('beforeExit', exitHandler.bind(null,{sendDisconnect:true, exit:true}));

//do something when app is closing
process.on('exit', exitHandler.bind(null,{sendDisconnect:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {sendDisconnect:true, exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));