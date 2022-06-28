const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildBanAdd',
    aliases: ['guildbanadd'],
    async execute(ban, Log) {
        try {
            Log.debug(`GUILD BAN ADDED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('GUILD BAN ADDED', ban);
            Log.debug(`GUILD BAN ADDED | Embed built successfully!`);
            Log.debug(`GUILD BAN ADDED | Attempting to send!`);
            await event.send(ban, { embeds: [newEmbed] }, Log);
        } catch (error) {
            Log.error(`GUILD BAN ADDED | Error when sending | ${error}`);
        }
    }
};