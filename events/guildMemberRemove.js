const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberRemove',
    aliases: ['guildmemberremove'],
    execute(member) {
        try {
            let newEmbed = new EmbedBuilder('GUILD MEMBER REMOVE', member);
            event.send(member, { embed: newEmbed });
        } catch (error) {
            console.error(error);
        }
    }
};