var output = require("./Output");

var EditMessageHelper = (function () 
{
    function EditMessageHelper() {}
	
    EditMessageHelper.prototype.editMessage = function (pipe, message, options) {
       
	   if(options.skypeMessageId != null)
	   {
			// TODO: Edit a message sent from skype to discord
			output.write("\nTODO: Edit a message sent from skype to discord.")
	   }
	   else if(options.discordMessageId != null)
	   {
		   // TODO: Edit a message sent from discord to skype
		   output.write("\nTODO: Edit a message sent from discord to skype.")
	   }
	   
    };
	
    EditMessageHelper.prototype.deleteMessage = function (pipe, options) {
       
	   if(options.skypeMessageId != null)
	   {
			// TODO: Delete a message sent from skype to discord
			output.write("\nTODO: Delete a message sent from skype to discord.")
	   }
	   else if(options.discordMessageId != null)
	   {
		   // TODO: Delete a message sent from discord to skype
		   output.write("\nTODO: Delete a message sent from discord to skype.")
	   }
	   
    };
	
    return EditMessageHelper;
	
})();

module.exports = EditMessageHelper;
