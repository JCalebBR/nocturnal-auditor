const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberRemove',
    aliases: ['guildmemberremove'],
    async execute(member, Log) {
        try {
            Log.debug(`GUILD MEMBER REMOVED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('GUILD MEMBER REMOVED', member);
            Log.debug(`GUILD MEMBER REMOVED | Embed built successfully!`);
            Log.debug(`GUILD MEMBER REMOVED | Attempting to send!`);
            await event.send(member, { embeds: [newEmbed] }, Log);
        } catch (error) {
            Log.error(`GUILD MEMBER REMOVED | Error when sending | ${error}`);
        }
    }
};