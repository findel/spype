var util = require("util");
var fs = require('fs');

var config = JSON.parse(fs.readFileSync("config.json"));
var pipes = require("./PipesHelper");
var DiscordClient = require('discord.io');

var DiscordHelper = 
{
	isConnected : false,
	debug : false,
	discord : null,
	Connect : function()
	{
		console.log("Connecting Discord...\n");
		try
		{
			this.discord = new DiscordClient({
				autorun: true,
				email: config.discord_email,
				password: config.discord_password
			});
			
			this.discord.on('ready', function() {
				console.log(" * Discord connected.\n")
				DiscordHelper.isConnected = true;
				pipes.each(function(pipe)
				{
					if(pipe.announceConnection)
						DiscordHelper.SendMessage(pipe, "Reconnected", "SPYPE");
				});
			});
			
			this.discord.on('message', DiscordHelper.discordMessageReceived);
		}
		catch(err)
		{
			console.log("DiscordHelper.Connect() error: \n");
			console.log(err);
			console.log("\n");
			this.isConnected = false;
		}
	},
	SendMessage : function(pipe, message, sender)
	{
		var discordMessage = "";
		
		//if(pipe.lastDiscordSender != null)
			//discordMessage += "\n";
		
		if(sender != null && sender != pipe.lastDiscordSender)
			discordMessage += util.format("**[%s]**\n", sender);

		discordMessage += message;
		
		console.log("DISCORD: (" + pipe.name + ") " + discordMessage);
		
		if(DiscordHelper.isConnected)
		{
			try
			{
				DiscordHelper.discord.sendMessage({ to: pipe.discordId, message: discordMessage, tts: false, typing: false}, function(err, response){
					if(DiscordHelper.debug)
					{
						console.log("SENT TO DISCORD:\n");
						console.log(response);
					}
				});
				pipe.lastDiscordSender = sender;
				console.log("SENT!\n");
			}
			catch(err)
			{
				console.log("FAILED! Error:\n");
				console.log(err);
				console.log("\n");
			}
		}
		else
		{
			console.log("FAILED! Discord is not connected.\n");
		}
	},
	Callbacks : [],
	MessageCallback : function(callback)
	{
		this.Callbacks.push(callback);
	},
	discordMessageReceived : function(user, userID, channelID, message, rawEvent)
	{
		if(user != config.discord_username)
		{
			var pipe = pipes.getPipe({ discordId: channelID });
			if(pipe != null)
			{
				// Discord message received, clear lastDiscordSender
				pipe.lastDiscordSender = null;
				// Output received object (testing)
				if(DiscordHelper.debug)
				{
					console.log("RECEIVED IN DISCORD\n");
					console.log(rawEvent);
					console.log("\n");
				}
				// Clean up message from discord (remove @User encoding)
				var cleanMessage = DiscordHelper.discord.fixMessage(message);
				// Send to callbacks
				for(var i = 0; i < DiscordHelper.Callbacks.length; i++)
				{
					DiscordHelper.Callbacks[i](pipe, cleanMessage, user);
				}
			}
		}
	}
}

module.exports = DiscordHelper;