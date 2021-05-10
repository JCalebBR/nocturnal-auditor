const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberUpdate',
    aliases: ['guildmemberupdate'],
    async execute(oldMember, Log, newMember = null,) {
        try {
            Log.debug(`GUILD MEMBER UPDATED | Attempting to build Embed!`);
            let newEmbed = new EmbedBuilder('GUILD MEMBER UPDATE', oldMember);
            Log.debug(`GUILD MEMBER UPDATED | Embed built successfully!`);
            Log.debug(`GUILD MEMBER UPDATED | Attempting to send!`);
            await event.send(oldMember, { embed: newEmbed }, Log);
        } catch (error) {
            Log.error(`GUILD MEMBER UPDATED | Error when sending | ${error}`);
        }
    }
};