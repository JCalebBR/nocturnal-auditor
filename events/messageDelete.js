const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'messageDelete',
    aliases: ['messagedelete'],
    async execute(message, audit, Log) {
        if (message.channel.type !== "text") return;

        let executor = "";
        if (audit.extra.channel.id === message.channel.id
            && (audit.target.id === message.author.id)
            && (audit.createdTimestamp > (Date.now() - 5000))
            && (audit.extra.count >= 1)) {
            executor = audit.executor;
        } else {
            executor = message.author;
        }

        if (message && message.member && typeof message.member.guild === "object") {
            try {
                Log.debug(`MESSAGE DELETED | Attempting to build Embed!`);
                let newEmbed = new EmbedBuilder('MESSAGE DELETED', message, null, executor);
                Log.debug(`MESSAGE DELETED | Embed built successfully!`);
                Log.debug(`MESSAGE DELETED | Attempting to send!`);
                await event.send(message, { embed: newEmbed }, Log);
            } catch (error) {
                Log.error(`MESSAGE DELETED | Error at embed build | ${error}`);
            }
        } else {
            Log.error(`MESSAGE DELETED | Member guild id couldn't be retrieved | Author ${message.author}, Member ${message.member}, Content ${message.content}`);
        }
    }
};