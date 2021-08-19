const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'threadCreate',
    aliases: ['threadcreate'],
    async execute(thread, Log) {
        Log.debug(`THREAD CREATED | Attempting to build Embed!`);
        let newEmbed = new EmbedBuilder('THREAD CREATED', thread,);
        Log.debug(`THREAD CREATED | Embed built successfully!`);
        Log.debug(`THREAD CREATED | Attempting to send!`);
        await event.send(thread, { embeds: [newEmbed] }, Log);
    }
};