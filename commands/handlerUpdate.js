const path = require("path");
const dirPath = path.resolve("./events/");
module.exports = {
    name: "handlerUpdate",
    aliases: ["hu", "handlerupdate", "hr"],
    args: true,
    guildOnly: false,
    cooldown: 0,
    description: "reloads a command",
    usage: "<command>",
    admin: true,
    execute(message, args) {
        const eventName = args[0].toLowerCase();
        const event = message.client.gEvents.get(eventName)
            || message.client.gEvents.find(evt => evt.aliases && evt.aliases.includes(eventName));

        if (!event) return message.reply(`There is no command with name or alias \`${eventName}\`!`);

        delete require.cache[require.resolve(`${dirPath}/${event.name}.js`)];

        try {
            const newEvent = require(`${dirPath}/${event.name}.js`);
            message.client.gEvents.set(newEvent.name, newEvent);
            message.reply(`Event handler \`${event.name}\` was updated!`);
        } catch (error) {
            console.error(error);
            message.channel.send(`There was an error while reloading a command \`${event.name}\`:\n\`${error.message}\``);
        }
    }
};