const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'threadUpdate',
    aliases: ['threadupdate'],
    async execute(thread, newThread, Log) {
        if (thread === newThread) return;
        Log.debug(`THREAD UPDATED | Attempting to build Embed!`);
        let newEmbed = new EmbedBuilder('THREAD UPDATED', thread, newThread);
        Log.debug(`THREAD UPDATED | Embed built successfully!`);
        Log.debug(`THREAD UPDATED | Attempting to send!`);
        await event.send(newThread, { embeds: [newEmbed] }, Log);
    }
};