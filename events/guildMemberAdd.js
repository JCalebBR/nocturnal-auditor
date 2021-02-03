const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberAdd',
    aliases: ['guildmemberadd'],
    execute(member) {
        try {
            let newEmbed = new EmbedBuilder('GUILD MEMBER ADD', member);
            event.send(member, { embed: newEmbed });
        } catch (error) {
            console.error(error);
        }
    }
};