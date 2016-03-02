var fs = require('fs');
var config = JSON.parse(fs.readFileSync("config.json"));

var PipesHelper = 
{
    pipes : config.pipes,
	
	setup : function()
	{
		// SET UP PIPES AND SAY SO
		console.log("\nSetting up the following pipes:\n");
		this.pipes.forEach(function(pipe)
		{
			pipe.lastSkypeSender = null;
			pipe.lastDiscordSender = null;
			console.log(" * " + pipe.name);
		});
	},
	
    getPipe : function (options)
	{
	   if(options.skypeId != null)
	   {
			var returnPipe = null;
			this.pipes.forEach(function(pipe)
			{
				if(options.skypeId == pipe.skypeId)
				{
					returnPipe = pipe;
				}
			});
			return returnPipe;
	   }
	   else if(options.discordId != null)
	   {
			var returnPipe = null;
			this.pipes.forEach(function(pipe)
			{
				if(options.discordId == pipe.discordId)
				{
					returnPipe = pipe;
				}
			});
			return returnPipe;
	   }
    },
	
	each : function (handler) 
	{
		this.pipes.forEach(function(pipe)
		{
			handler(pipe);
		});
	}

}

module.exports = PipesHelper;
