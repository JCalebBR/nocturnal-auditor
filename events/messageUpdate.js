const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'messageUpdate',
    aliases: ['messageupdate'],
    async execute(oldMessage, newMessage, Log) {
        const channels = ["GUILD_TEXT", "GUILD_PUBLIC_THREAD", "GUILD_PRIVATE_THREAD", "GUILD_NEWS", "GUILD_NEWS_THREAD"];
        if (!channels.includes(oldMessage.channel.type)) {
            Log.debug(`MESSAGE UPDATED | UNSUPPORTED CHANNEL TYPE!`);
            return;
        }
        if (oldMessage.content === newMessage.content) return;

        try {
            Log.debug(`MESSAGE UPDATED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            Log.debug(`MESSAGE UPDATED | Embed built successfully!`);
            Log.debug(`MESSAGE UPDATED | Attempting to send!`);
            await event.send(newMessage, { embeds: [newEmbed] }, Log);
        } catch (error) {
            delete oldMessage.content;
            delete newMessage.content;
            Log.error(`MESSAGE UPDATED | Error when sending | ${error}`);
            Log.debug(`MESSAGE UPDATED | Attempting to build lazy Embed!`);
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            Log.debug(`MESSAGE UPDATED | Lazy Embed built successfully!`);
            Log.debug(`MESSAGE UPDATED | Attempting to send!`);
            await event.send(newMessage, { embeds: [newEmbed] }, Log);
        }
    }
};