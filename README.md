# spype

[![Join the chat at https://gitter.im/findel/spype](https://badges.gitter.im/findel/spype.svg)](https://gitter.im/findel/spype?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A nodejs command line app to create a text relay between Discord and Skype. This simple (read work in progress) app allows you to create "pipes" between a specfic Skype chat and a Discord text channel.  

## Instructions

* You need to have Node JS and `npm` installed.
* Copy the `config.json.example` as `config.json` and set up. See "Configuration" below.
* Run `npm install` to install the dependencies.
* Finally (I think), run `node spype.js` to start Spype.
    * For additional useful info output in the console, use `node spype.js debug`.

## Updating to latest version

* Check for changes to `config.json.example` and make appropriate changes to your `config.json` file.
* Run `npm install` to install any changes to dependencies.

## Configuration

Spype needs a `config.json` file in the same directory as `spype.js` to work. Use the `config.json.example` as a starting point.

### Enter the Skype and Discord account details

These should not be your personal log in details, but the details of accounts specifically setup to run Spype. Personally I use the same name for the accound on both Discord and Skype. This account will be used to relay the messages from one chat to another, with the usernames of the senders included in the relayed messages.

For discord you can use a 'user account' or a 'bot account'. A bot account is the standard way, and you can [create one here](https://discordapp.com/developers/applications/me#top).

For Skype, spype currently uses a normal user account.

### Set up your 'pipes' 

Replace the `pipes` in your `config.json` with the Discord-to-Skype connections that you want to have.

To find the conversation ID (`skypeId`) for a Skype chat. use the `/get name` command in the Skype client.

The Discord channel ID (`discordId`) can be found as the last part of the URL when using Discord in a browser, or by using the "Copy Link" option when right clicking on a channel in the client. 


