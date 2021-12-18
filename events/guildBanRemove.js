const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildBanRemove',
    aliases: ['guildbanremove'],
    async execute(ban, Log) {
        try {
            Log.debug(`GUILD BAN REMOVED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('GUILD BAN REMOVED', ban);
            Log.debug(`GUILD BAN REMOVED | Embed built successfully!`);
            Log.debug(`GUILD BAN REMOVED | Attempting to send!`);
            await event.send(ban, { embeds: [newEmbed] }, Log);
        } catch (error) {
            Log.error(`GUILD BAN REMOVED | Error when sending | ${error}`);
        }
    }
};