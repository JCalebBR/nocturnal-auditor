const { SlashCommandBuilder } = require('@discordjs/builders');
const { Guild } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans an user")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("User to ban!")
                .setRequired(true))
        .setDefaultPermission(false),
    async execute(interaction, guild) {
        const user = interaction.options.get("target")?.value;
        guild.members.ban(user);
        interaction.reply(`User <@${user}> banned succesfully!`);
    },
};

/*
const guild = client.guilds.cache.find(guild => guild.id === guild.id);
    const perms = {
        id: '400055042893414420',
        type: 'ROLE',
        permission: true,
    };

    let commandsList = await guild.commands.fetch();

    await commandsList.forEach(slashCommand => {
        console.log(`Changing command ${slashCommand.id}`);
        //set the permissions for each slashCommand
        guild.commands.permissions.add({
            command: slashCommand.id,
            permissions: [perms]
        });
    });
*/