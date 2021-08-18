module.exports = {
    name: "ping",
    aliases: [],
    args: false,
    guildOnly: true,
    description: "",
    usage: "",
    execute(message) {
        message.reply("pong!");
    }
};