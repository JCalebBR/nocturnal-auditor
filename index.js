const fs = require('fs');

const Discord = require('discord.js');
const { token, prefix } = require('./config.json');
// PATCH TO ADD GUILDMEMBER.PENDING
const { Structures } = require('discord.js');

Structures.extend('GuildMember', GuildMember => {
    class GuildMemberWithPending extends GuildMember {
        pending = false;

        constructor(client, data, guild) {
            super(client, data, guild);
            this.pending = data.pending ?? false;
        }

        _patch(data) {
            super._patch(data);
            this.pending = data.pending ?? false;
        }
    }
    return GuildMemberWithPending;
});

const client = new Discord.Client();
const path = require('path');
const eventsDirPath = path.resolve(__dirname, './events');
const commandsDirPath = path.resolve(__dirname, './commands');

client.gEvents = new Discord.Collection();
const eventFiles = fs.readdirSync(eventsDirPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.gEvents.set(event.name, event);
}

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(commandsDirPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}


const cooldowns = new Discord.Collection();

// Ready
client.once('ready', () => {
    console.log('Ready!');
    // Presence
    client.user.setPresence({ activity: { name: 'everything', type: 'LISTENING' }, status: 'online' })
        .catch(console.error);
});

// Login using token
client.login(token);

// Commands
client.on('message', async message => {
    // Checks if message starts with a prefix or if it's not from another bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Split args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    // Actual command received
    const commandName = args.shift().toLowerCase();
    // Check if there isd a command file for the command or if it is an alias
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    // If no command found, exit
    if (!command) return;
    // Checks if the command is for staff use
    if (command.admin) {
        if (!message.member.roles.cache.find(r => r.name === "Moderators")) {
            message.channel.send(`I'm sorry ${message.author}, I'm afraid I can't do that\nYou don't have the necessary role.`);
        }
    }
    // Checks if the command is meant to be used only in servers
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }
    // Checks if the command needs arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments!`;
        // If it has a usage guide, send it
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${commandName} ${command.usage}\``;
        }

        return message.reply(reply);
    }
    // Cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 2) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args, commandName);
    } catch (error) {
        console.error(error);
        message.reply(`I tried so hard... but in the end... I couldn't do what you asked.`);
    }
});

// Event listening
client.on("messageDelete", async message => {
    eventName = "messagedelete";
    console.log(eventName);
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' })
        .then(audit => audit.entries.first())
        .then(audit => {
            event.execute(message, audit);
        });
});

client.on("messageUpdate", (oldMessage, newMessage) => {
    eventName = "messageupdate";
    console.log(eventName);
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    event.execute(oldMessage, newMessage);
});

client.on("guildMemberAdd", member => {
    eventName = "guildmemberadd";
    console.log(eventName);
    member.send("Hello there!, welcome to the server");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    event.execute(member);
});

client.on("guildMemberRemove", member => {
    eventName = "guildmemberremove";
    console.log(eventName);
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    event.execute(member);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    eventName = "guildmemberupdate";
    console.log(eventName);
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    if (oldMember.pending && !newMember.pending) {
        try {
            const role = newMember.guild.roles.cache.find(role => role.name === 'Meme Peasant');
            if (role) await newMember.roles.add(role).catch(console.error);
            event.execute(newMember);
        } catch (error) {
            console.log(error);
        }
    }
    // else {
    //     let options;
    //     try {
    //         // Initialize option if empty
    //         if (!options) {
    //             options = {};
    //         }

    //         if (options[newMember.guild.id]) {
    //             options = options[newMember.guild.id];
    //         }

    //         // Add default empty list
    //         if (typeof options.excludedroles === "undefined") options.excludedroles = new Array([]);
    //         if (typeof options.trackroles === "undefined") options.trackroles = false;
    //         if (options.trackroles !== false) {
    //             const oldMemberRoles = oldMember.roles.cache.keyArray();
    //             const newMemberRoles = newMember.roles.cache.keyArray();


    //             // Check inspired by https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
    //             const oldRoles = oldMemberRoles.filter(x => !options.excludedroles.includes(x)).filter(x => !newMemberRoles.includes(x));
    //             const newRoles = newMemberRoles.filter(x => !options.excludedroles.includes(x)).filter(x => !oldMemberRoles.includes(x));

    //             const rolechanged = (newRoles.length || oldRoles.length);

    //             if (rolechanged) {
    //                 let roleadded = "";
    //                 if (newRoles.length > 0) {
    //                     for (let i = 0; i < newRoles.length; i++) {
    //                         if (i > 0) roleadded += ", ";
    //                         roleadded += `<@&${newRoles[i]}>`;
    //                     }
    //                 }

    //                 let roleremoved = "";
    //                 if (oldRoles.length > 0) {
    //                     for (let i = 0; i < oldRoles.length; i++) {
    //                         if (i > 0) roleremoved += ", ";
    //                         roleremoved += `<@&${oldRoles[i]}>`;
    //                     }
    //                 }
    //                 event.execute(oldMember, newMember, roleadded, roleremoved);
    //             };
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
});

