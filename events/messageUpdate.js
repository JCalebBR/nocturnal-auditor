const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'messageUpdate',
    aliases: ['messageupdate'],
    execute(oldMessage, newMessage) {
        if (oldMessage.channel.type !== "text") return;
        if (newMessage.channel.type !== "text") return;
        if (oldMessage.content === newMessage.content) return;

        try {
            let newEmbed = new EmbedBuilder('MESSAGE UPDATED', oldMessage, newMessage);
            event.send(newMessage, { embed: newEmbed });
        } catch (error) {
            console.error(error);
        }
    }
};