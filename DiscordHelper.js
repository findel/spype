var util = require("util");
var fs = require('fs');

var config = JSON.parse(fs.readFileSync("config.json"));
var output = require("./Output");
var pipes = require("./PipesHelper");
var Discord = require('discord.io');

var DiscordHelper = 
{
	isConnected : false,
	debug : false,
	discord : null,
	Connect : function()
	{
		output.write("Connecting Discord...\n");
		try
		{
			if(config.discord_token)
			{
				this.discord = new Discord.Client({
					autorun: true,
					token: config.discord_token
				});
			}
			else
			{
				this.discord = new Discord.Client({
					autorun: true,
					email: config.discord_email,
					password: config.discord_password
				});
			}

			
			this.discord.on('ready', function() {
				output.write(" * Discord connected.\n")
				DiscordHelper.isConnected = true;
				pipes.each(function(pipe)
				{
					if(pipe.announceConnection)
						DiscordHelper.SendMessage(pipe, "Reconnected", "SPYPE");
				});
			});
			
			this.discord.on('message', DiscordHelper.discordMessageReceived);
			this.discord.on('disconnected', DiscordHelper.discordDisconnected);
		}
		catch(err)
		{
			output.write("DiscordHelper.Connect() error: \n");
			output.write(err);
			output.write("\n");
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
		
		output.write("DISCORD: (" + pipe.name + ") " + discordMessage);
		
		if(DiscordHelper.isConnected)
		{
			try
			{
				DiscordHelper.discord.sendMessage(
					{ 
						to: pipe.discordId, 
						message: discordMessage, 
						tts: false, 
						typing: false
					}, 
					function(err, response)
					{
						if(DiscordHelper.debug)
						{
							output.write("SENT TO DISCORD:\n");
							output.write(response);
						}
						if(err)
						{
							output.write("FAILED! Error:\n");
							output.write(err);
							output.write("\n");
						}
					}
				);
				pipe.lastDiscordSender = sender;
				output.write("SENT!\n");
			}
			catch(err)
			{
				output.write("FAILED! Error:\n");
				output.write(err);
				output.write("\n");
			}
		}
		else
		{
			output.write("FAILED! Discord is not connected.\n");
		}
	},
	Callbacks : [],
	MessageCallback : function(callback)
	{
		this.Callbacks.push(callback);
	},
	discordMessageReceived : function(user, userID, channelID, message, rawEvent)
	{
		if(userID != DiscordHelper.discord.id)
		{
			var pipe = pipes.getPipe({ discordId: channelID });
			if(pipe != null)
			{
				// Discord message received, clear lastDiscordSender
				pipe.lastDiscordSender = null;
				// Output received object (testing)
				if(DiscordHelper.debug)
				{
					output.write("RECEIVED IN DISCORD\n");
					output.write(rawEvent);
					output.write("\n");
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
	},
	discordDisconnected : function()
	{
		output.write(" * Discord disconnected.\n");
		process.exit();
	}
}

module.exports = DiscordHelper;