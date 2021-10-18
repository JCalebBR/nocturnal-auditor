const { CronJob } = require("cron");
const fs = require("fs");

const Discord = require("discord.js");
const { token, prefix } = require("./config.json");

const botIntents = new Discord.Intents();
botIntents.add(
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_BANS);

const client = new Discord.Client({ intents: botIntents });
const path = require("path");
const Logging = require("./util/log");
const eventsDirPath = path.resolve(__dirname, "./events");
const commandsDirPath = path.resolve(__dirname, "./commands");

const Log = new Logging();
client.gEvents = new Discord.Collection();
const eventFiles = fs.readdirSync(eventsDirPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.gEvents.set(event.name, event);
}

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(commandsDirPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

const fiveMinutesDirPath = path.resolve(__dirname, "./commands/five-minutes");
const fiveMinutesCommands = fs.readdirSync(fiveMinutesDirPath).filter(file => file.endsWith(".js"));
client.fiveMinutes = new Discord.Collection();
for (const file of fiveMinutesCommands) {
    const command = require(`${fiveMinutesDirPath}/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.fiveMinutes.set(command.name, command);
}

const hourlyDirPath = path.resolve(__dirname, "./commands/hourly");
const hourlyCommands = fs.readdirSync(hourlyDirPath).filter(file => file.endsWith(".js"));
client.hourly = new Discord.Collection();
for (const file of hourlyCommands) {
    const command = require(`${hourlyDirPath}/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.hourly.set(command.name, command);
}

const cooldowns = new Discord.Collection();

// Ready
client.once("ready", () => {
    Log.log("Ready!");
    // Presence
    client.user.setPresence({ activities: [{ name: "everything", type: "LISTENING" }], status: "online" });
    const fiveminutes = new CronJob("*/5 * * * *", async () => {
        Log.debug("Running fiveminutes jobs!");
        fiveMinutesCommands.forEach(async commandName => {
            commandName = commandName.replace(".js", "");
            const command = client.fiveMinutes.get(commandName)
                || client.fiveMinutes.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            try {
                Log.debug(`I'm trying to run ${commandName}`);
                await command.execute(client, Log);
                Log.debug(`${commandName} done!`);
            } catch (error) {
                Log.error(`I tried to use ${commandName}, which resulted in an error | ${error}`);
            }
        });
    });
    const hour = new CronJob("0 * * * *", async () => {
        Log.debug("Running hourly jobs!");
        hourlyCommands.forEach(async commandName => {
            commandName = commandName.replace(".js", "");
            const command = client.hourly.get(commandName)
                || client.hourly.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            try {
                Log.debug(`I'm trying to run ${commandName}`);
                await command.execute(client, Log);
                Log.debug(`${commandName} done!`);
            } catch (error) {
                Log.error(`I tried to use ${commandName}, which resulted in an error | ${error}`);
            }
        });
    });
    fiveminutes.start();
    hour.start();
});

// Login using token
client.login(token);

// Commands
client.on("messageCreate", async message => {
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
    if (command.guildOnly && message.channel.type === "DM") {
        Log.warn(`${message.author} tried to use the command "${command}" inside of DMs, but the command is guildOnly`);
        message.reply("I can\'t execute that command inside DMs!");
        return;
    }
    // Checks if the command needs arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments!`;
        // If it has a usage guide, send it
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${commandName} ${command.usage}\``;
        }
        Log.error(`${message.author} tried to use the command "${command}" without arguments!`);
        message.reply(reply);
        return;
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
            message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            return;
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        message.channel.sendTyping();
        await command.execute(message, args, Log);
    } catch (error) {
        Log.error(`${message.author} tried to use ${command}, which resulted in an error | ${error}`);
        message.reply(`I tried so hard... but in the end... I couldn't do what you asked.`);
    }
});

// Event listening
client.on("messageDelete", async message => {
    const eventName = "messagedelete";
    Log.debug("MESSAGE DELETED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' })
        .then(audit => audit.entries.first())
        .then(async audit => {
            Log.debug("MESSAGE DELETED | Attempting to audit!");
            await event.execute(message, audit, Log);
        })
        .catch(error => Log.error(`MESSAGE DELETED | Error at audition | ${error}`));
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    const eventName = "messageupdate";
    Log.debug("MESSAGE UPDATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("MESSAGE UPDATED | Attempting to audit!");
    await event.execute(oldMessage, newMessage, Log);
});

client.on("guildMemberAdd", async member => {
    const eventName = "guildmemberadd";
    Log.debug("GUILD MEMBER ADDED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("GUILD MEMBER ADDED | Attempting to audit!");
    await event.execute(member, Log);
});

client.on("guildMemberRemove", async member => {
    const eventName = "guildmemberremove";
    Log.debug("GUILD MEMBER REMOVED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("GUILD MEMBER REMOVED | Attempting to audit!");
    await event.execute(member, Log);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const eventName = "guildmemberupdate";
    Log.debug("GUILD MEMBER UPDATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug(`GUILD MEMBER UPDATED | Attempting to audit!`);
    if (oldMember.pending && !newMember.pending) {
        Log.debug("GUILD MEMBER UPDATED | Rules acceptance changed!");
        try {
            // Find Role Func
            let roleFind = async () => {
                return oldMember.guild.roles.cache.find(
                    role => role.name === "Core Kid" || role.id === "782021464060330034");
            };
            Log.debug(`GUILD MEMBER UPDATED | Attempting to give default role!`);
            // Await Role
            await roleFind()
                // Give Role
                .then(role => newMember.roles.set([role]))
                .catch(error => Log.error(`GUILD MEMBER UPDATED | Role change failed! | ${error}`));
            await event.execute(newMember, Log);
        } catch (error) {
            Log.error(`GUILD MEMBER UPDATED | Something broke! | ${error}`);
        }
    }
});

client.on("threadCreate", async thread => {
    const eventName = "threadcreate";
    Log.debug("THREAD CREATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("THREAD CREATED  | Attempting to audit!");
    await event.execute(thread, Log);
});

client.on("threadUpdate", async (thread, newThread) => {
    const eventName = "threadupdate";
    Log.debug("THREAD UPDATED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("THREAD UPDATED  | Attempting to audit!");
    await event.execute(thread, newThread, Log);
});

client.on("threadDelete", async thread => {
    const eventName = "threaddelete";
    Log.debug("THREAD DELETED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("THREAD DELETED  | Attempting to audit!");
    await event.execute(thread, Log);
});