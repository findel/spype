# spype

A nodejs command line app to create a text relay between Discord and Skype. This simple (read work in progress) app allows you to create "pipes" between a specfic Skype chat and a Discord text channel.  

## Instructions

* You need to have Node JS and `npm` installed.
* Copy the `config.json.example` as `config.json`, and replace the `pipes` in your `config.json` with the connections that you want to have.
    * To find the conversation ID (`skypeId`) for a Skype chat. use the `/get name` command in the Skype client.
    * The Discord channel ID (`discordId`) can be found as the last part of the URL when using Discord in a browser, or by using the "Copy Link" option when right clicking on a channel in the client. 
* Run `npm install` to install the dependencies. 

## Updating to latest version

* Check for changes to `config.json.example` and make appropriate changes to your `config.json` file.
* Run `npm install` to install any changes to dependencies.
