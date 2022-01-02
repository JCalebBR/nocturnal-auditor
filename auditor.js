const { Job } = require("@simpleview/async-cron");
const fs = require("fs");

const Discord = require("discord.js");
const { guildId, token, prefix } = require("./config.json");
const db = require("./sqlite/database");
const terms = require("./sqlite/terms");

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
const Log = new Logging();

const interactionsDirPath = path.resolve(__dirname, "./interactions");
const commandsDirPath = path.resolve(__dirname, "./commands");
const eventsDirPath = path.resolve(__dirname, "./events");

client.interactions = new Discord.Collection();
const interactionFiles = fs.readdirSync(interactionsDirPath).filter(file => file.endsWith(".js"));
for (const file of interactionFiles) {
    const command = require(`${interactionsDirPath}/${file}`);
    client.interactions.set(command.data.name, command);
}

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(commandsDirPath).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`${commandsDirPath}/${file}`);
    client.commands.set(command.name, command);
}

client.gEvents = new Discord.Collection();
const eventFiles = fs.readdirSync(eventsDirPath).filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`${eventsDirPath}/${file}`);
    client.gEvents.set(event.name, event);
}

const fiveMinutesDirPath = path.resolve(__dirname, "./commands/five-minutes");
const fiveMinutesCommands = fs.readdirSync(fiveMinutesDirPath).filter(file => file.endsWith(".js"));
client.fiveMinutes = new Discord.Collection();
for (const file of fiveMinutesCommands) {
    const command = require(`${fiveMinutesDirPath}/${file}`);
    client.fiveMinutes.set(command.name, command);
}

const hourlyDirPath = path.resolve(__dirname, "./commands/hourly");
const hourlyCommands = fs.readdirSync(hourlyDirPath).filter(file => file.endsWith(".js"));
client.hourly = new Discord.Collection();
for (const file of hourlyCommands) {
    const command = require(`${hourlyDirPath}/${file}`);
    client.hourly.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once("ready", async () => {
    Log.log("Ready!");
    // Presence
    client.user.setPresence({ activities: [{ name: "everything", type: "LISTENING" }], status: "online" });
    const fiveminutes = new Job({ schedule: "*/5 * * * *" }, async () => {
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
    const hour = new Job({ schedule: "0 * * * *" }, async () => {
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
    fiveminutes.on("error", (err) => Log.error(`FiveMinutes CronJob Error: ${err}`));
    hour.on("error", (err) => Log.error(`Hourly CronJob Error: ${err}`));
    fiveminutes.start();
    hour.start();

    await db.authenticate()
        .then(() => {
            Log.log("Connected to DB!");
            terms.init(db);
            terms.sync();
        })
        .catch(Log.error);
});

client.login(token);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.interactions.get(interaction.commandName);
    const guild = client.guilds.cache.find(guild => guild.id === guildId);
    if (!command) return;

    try {
        await command.execute(interaction, guild);
    } catch (error) {
        Log.error(`Interaction Error | ${command} | ${error}`);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) {
        await terms.findAll({ order: [["type", "ASC"], ["term", "ASC"]] })
            .then(data => {
                if (!data.length) return;
                else {
                    data.forEach(term => {
                        term = term.dataValues;
                        if (message.content.toLowerCase().includes(term.term)) {
                            const member = message.member;
                            message.delete();
                            Log.warn(`Deleted ${message.author} message, said ${term.type} | ${term.term}`);
                            member.timeout(60 * 60 * 1000, `Said ${term.type} | ${term.term}`)
                                .then(() => Log.warn(`Timed out ${message.author}`))
                                .catch(Log.error);
                            // @ts-ignore
                            message.client.channels.cache.get("819276503874797609").send(`I timed out ${message.author} because they said \`${term.type}\` \`${term.term}\` in ${message.channel}`);
                            return;
                        }
                    });
                }
            })
            .catch(Log.error);
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        Log.error(`${message.author} tried to use the command "${command}" which doesn't appear to exist!`);
        return;
    }

    if (command.admin) {
        if (!message.member.roles.cache.find(r => r.name === "Moderators")) {
            Log.warn(`${message.author} tried to use the staff command "${command}"!`);
            message.channel.send(`I'm sorry ${message.author}, I'm afraid I can't do that\nYou don't have the necessary role.`);
        }
    }

    if (command.guildOnly && message.channel.type === "DM") {
        Log.warn(`${message.author} tried to use the command "${command}" inside of DMs, but the command is guildOnly`);
        message.reply("I can\'t execute that command inside DMs!");
        return;
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${commandName} ${command.usage}\``;
        }
        Log.error(`${message.author} tried to use the command "${command}" without arguments!`);
        message.reply(reply);
        return;
    }

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
        await command.execute(message, args, Log, terms);
    } catch (error) {
        Log.error(`${message.author} tried to use ${command}, which resulted in an error | ${error}`);
        message.reply(`I tried so hard... but in the end... I couldn't do what you asked.`);
    }
});

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

client.on("guildBanAdd", async ban => {
    const eventName = "guildbanadd";
    Log.debug("GUILD BAN ADDED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("GUILD BAN ADDED  | Attempting to audit!");
    await event.execute(ban, Log);
});

client.on("guildBanRemove", async ban => {
    const eventName = "guildbanremove";
    Log.debug("GUILD BAN REMOVED | Event received!");
    const event = client.gEvents.get(eventName)
        || client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));
    Log.debug("GUILD BAN REMOVED  | Attempting to audit!");
    await event.execute(ban, Log);
});

