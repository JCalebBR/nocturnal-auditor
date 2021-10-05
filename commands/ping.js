module.exports = {
    name: "ping",
    aliases: ["pong"],
    args: false,
    guildOnly: true,
    description: "Checks latency or if the bot is alive",
    usage: "",
    tag: "Misc.",
    execute(message) {
        message.reply(`🤖 BOT latency is \`${Date.now() - message.createdTimestamp}ms\`\n🏓 API Latency is \`${Math.round(message.client.ws.ping)}ms\``);
    }
};