const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');
const { DiscordAPIError } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    aliases: ['messageupdate'],
    async execute(oldMessage, newMessage) {
        if (oldMessage.channel.type !== "text") return;
        if (newMessage.channel.type !== "text") return;
        if (oldMessage.content === newMessage.content) return;

        try {
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            await event.send(newMessage, { embed: newEmbed });
        } catch (error) {
            delete oldMessage.content;
            delete newMessage.content;
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            await event.send(newMessage, { embed: newEmbed });
            console.error(error);
        }
    }
};