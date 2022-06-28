const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'threadDelete',
    aliases: ['threaddelete'],
    async execute(thread, Log) {
        Log.debug(`THREAD DELETED | Attempting to build Embed!`);
        let newEmbed = new EmbedBuilder('THREAD DELETED', thread);
        Log.debug(`THREAD DELETED | Embed built successfully!`);
        Log.debug(`THREAD DELETED | Attempting to send!`);
        await event.send(thread, { embeds: [newEmbed] }, Log);
    }
};