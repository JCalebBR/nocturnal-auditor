const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberAdd',
    aliases: ['guildmemberadd'],
    async execute(member, Log) {
        try {
            Log.debug(`GUILD MEMBER ADDED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('GUILD MEMBER ADDED', member);
            Log.debug(`GUILD MEMBER ADDED | Embed built successfully!`);
            Log.debug(`GUILD MEMBER ADDED | Attempting to send!`);
            await event.send(member, { embeds: [newEmbed] }, Log);
        } catch (error) {
            Log.error(`GUILD MEMBER ADDED | Error when sending | ${error}`);
        }
    }
};