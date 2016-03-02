var util = require("util");
var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));

var debug = process.argv[2] == "debug" ? true : false;

//var EditMessageHelper = require("./EditMessageHelper");
//var editHelper = new EditMessageHelper();

var pipes = require("./PipesHelper");

// SET UP PIPES AND SAY SO
pipes.setup();

// LOAD Skype
var SkypeHelper = require("./SkypeHelper");
SkypeHelper.debug = debug;
SkypeHelper.Connect();

// LOAD Discord
var DiscordHelper = require("./DiscordHelper");
DiscordHelper.debug = debug;
DiscordHelper.Connect();

// Register Callbacks 

	// Skype to Discord
	SkypeHelper.MessageCallback(DiscordHelper.SendMessage);
	// Discord to Skype
	DiscordHelper.MessageCallback(SkypeHelper.SendMessage);

var sayToAll = function(message)
{
	pipes.each(function(pipe)
	{
		if(pipe.announceConnection)
		{
			SkypeHelper.SendMessage(pipe, message, "SPYPE");
			DiscordHelper.SendMessage(pipe, message, "SPYPE");
		}
	});
}
	
var sendDisconnectedMessages = function()
{
	pipes.each(function(pipe)
	{
		if(pipe.announceConnection)
		{
			SkypeHelper.SendMessage(pipe, "Disconnected", "SPYPE");
			DiscordHelper.SendMessage(pipe, "Disconnected", "SPYPE");
		}
	});
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (text) 
{
	if(text.startsWith("/say "))
	{
		var message = text.replace("/say ", "");
		sayToAll(message);
	}
});

//do something when app is closing
process.on('SIGHUP', function()
{
	console.log("SIGHUP\n");
	sendDisconnectedMessages();
});
