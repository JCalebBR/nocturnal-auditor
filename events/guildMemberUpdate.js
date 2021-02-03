const event = require('../util/send.js');
const EmbedBuilder = require('../util/EmbedBuilder.js');

module.exports = {
    name: 'guildMemberUpdate',
    aliases: ['guildmemberupdate'],
    execute(oldMember, newMember = null, roleadded = null, roleremoved = null) {
        if (!roleadded) {
            try {
                let newEmbed = new EmbedBuilder('GUILD MEMBER UPDATE', oldMember);
                event.send(oldMember, { embed: newEmbed });
            } catch (error) {
                console.error(error);
            }
        }
        //  else {
        //     try {
        //         let newEmbed = new EmbedBuilder('GUILD MEMBER UPDATE', newMember);
        //         newEmbed.fields = [{
        //             name: "**Roles removed : **",
        //             value: `**${roleremoved} **`,
        //             inline: true
        //         }, {
        //             name: "**Roles added : **",
        //             value: `**${roleadded} **`,
        //             inline: true
        //         }];
        //         event.send(newMember, { embed: newEmbed });
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }
    }
};