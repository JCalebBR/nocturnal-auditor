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
            // @ts-ignore
            super._patch(data);
            this.pending = data.pending ?? false;
        }
    }
    return GuildMemberWithPending;
});

const client = new Discord.Client();
const path = require('path');
const Logging = require('./util/log');
const eventsDirPath = path.resolve(__dirname, './events');
const commandsDirPath = path.resolve(__dirname, './commands');

const Log = new Logging();

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
    Log.log("Ready!");
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
    // Check if there is a command file for the command or if it is an alias
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    // If no command found, exit
    if (!command) {
        Log.error(`${message.author} tried to use the command "${command}" which doesn't appear to exist!`);
        return;
    }
    // Checks if the command is for staff use
    if (command.admin) {
        if (!message.member.roles.cache.find(r => r.name === "Moderators")) {
            Log.warn(`${message.author} tried to use the staff command "${command}"!`);
            message.channel.send(`I'm sorry ${message.author}, I'm afraid I can't do that\nYou don't have the necessary role.`);
        }
    }
    // Checks if the command is meant to be used only in servers
    if (command.guildOnly && message.channel.type === 'dm') {
        Log.warn(`${message.author} tried to use the command "${command}" inside of DMs, but the command is guildOnly`);
        return message.reply('I can\'t execute that command inside DMs!');
    }
    // Checks if the command needs arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments!`;
        // If it has a usage guide, send it
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${commandName} ${command.usage}\``;
        }
        Log.error(`${message.author} tried to use the command "${command}" without arguments!`);
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
            Log.debug(`${message.author} tried to use the command "${command}" while it was on cooldown!`);
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args, commandName);
    } catch (error) {
        Log.error(`${message.author} tried to use ${command}, which resulted in an error | ${error}`);
        message.reply(`I tried so hard... but in the end... I couldn't do what you asked.`);
    }
});

let eventName;
// Event listening
client.on("messageDelete", async message => {
    eventName = "messagedelete";
    Log.debug("MESSAGE DELETED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' })
        .then(audit => audit.entries.first())
        .then(async audit => {
            Log.debug(`MESSAGE DELETED | Attempting to audit!`);
            await event.execute(message, audit, Log);
        })
        .catch(error => Log.error(`MESSAGE DELETED | Error at audition | ${error}`));
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    eventName = "messageupdate";
    Log.debug("MESSAGE UPDATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug(`MESSAGE UPDATED | Attempting to audit!`);
    await event.execute(oldMessage, newMessage, Log);
});

client.on("guildMemberAdd", async member => {
    eventName = "guildmemberadd";
    Log.debug("GUILD MEMBER ADDED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug(`GUILD MEMBER ADDED | Attempting to audit!`);
    await event.execute(member, Log);
});

client.on("guildMemberRemove", async member => {
    eventName = "guildmemberremove";
    Log.debug("GUILD MEMBER REMOVED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug(`GUILD MEMBER REMOVED | Attempting to audit!`);
    await event.execute(member, Log);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    eventName = "guildmemberupdate";
    Log.debug("GUILD MEMBER UPDATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug(`GUILD MEMBER UPDATED | Attempting to audit!`);
    // @ts-ignore
    if (oldMember.pending && !newMember.pending) {
        Log.debug("GUILD MEMBER UPDATED | Rules acceptance changed!");
        try {
            const role = newMember.guild.roles.cache.find(
                role => role.name === 'Meme Peasant' || role.id === "782021464060330034");
            Log.debug(`GUILD MEMBER UPDATED | Attempting to give default role ${role}!`);
            if (role) {
                oldMember.roles.add(role);
                newMember.roles.add(role);
                Log.debug("I'm here");
            }
            // .catch(error => Log.error(`GUILD MEMBER UPDATED | Role change failed! | ${error}`));
            await event.execute(newMember, Log);
        } catch (error) {
            Log.error(`GUILD MEMBER UPDATED | Something broke! | ${error}`);
        }
    }
});
