const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'messageDelete',
    aliases: ['messagedelete'],
    execute(message, audit) {
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
                let newEmbed = new EmbedBuilder('MESSAGE DELETED', message, null, executor);
                event.send(message, { embed: newEmbed });
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log(`messageDelete - ERROR - member guild id couldn't be retrieved`);
            console.log("author", message.author);
            console.log("member", message.member);
            console.log("content", message.content);
        }
    }
};