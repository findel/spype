
var PipesHelper = (function () 
{
    function PipesHelper(config) {
		this.pipes = config.pipes;
	}
	
	PipesHelper.prototype.setup = function()
	{
		// SET UP PIPES AND SAY SO
		console.log("Setting up the following pipes:");
		this.pipes.forEach(function(pipe)
		{
			pipe.lastSkypeSender = null;
			pipe.lastDiscordSender = null;
			console.log("* " + pipe.name);
		});
	}
	
    PipesHelper.prototype.getPipe = function (options)
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
    };
	
	PipesHelper.prototype.each = function (handler) 
	{
		this.pipes.forEach(function(pipe)
		{
			handler(pipe);
		});
	}
	
    return PipesHelper;
})();

module.exports = PipesHelper;
