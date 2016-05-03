var output = 
{
	lastTimeStamp : null,
	write : function(message)
	{
		var date =  new Date();
		var timestamp = date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes();
		
		if(timestamp != output.lastTimeStamp)
		{
			message = timestamp + " --- \n" + message;
			output.lastTimeStamp = timestamp;
		}
		
		console.log(message);
	}
}

module.exports = output;