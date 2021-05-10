const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');
const { DiscordAPIError } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    aliases: ['messageupdate'],
    async execute(oldMessage, newMessage, Log) {
        if (oldMessage.channel.type !== "text") return;
        if (oldMessage.content === newMessage.content) return;

        try {
            Log.debug(`MESSAGE UPDATED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            Log.debug(`MESSAGE UPDATED | Embed built successfully!`);
            Log.debug(`MESSAGE UPDATED | Attempting to send!`);
            await event.send(newMessage, { embed: newEmbed }, Log);
        } catch (error) {
            delete oldMessage.content;
            delete newMessage.content;
            Log.error(`MESSAGE UPDATED | Error when sending | ${error}`);
            Log.debug(`MESSAGE UPDATED | Attempting to build lazy Embed!`);
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            Log.debug(`MESSAGE UPDATED | Lazy Embed built successfully!`);
            Log.debug(`MESSAGE UPDATED | Attempting to send!`);
            await event.send(newMessage, { embed: newEmbed }, Log);
        }
    }
};