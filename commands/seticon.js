module.exports = {
    name: "seticon",
    aliases: ["si", "seti"],
    args: false,
    guildOnly: true,
    description: "Sets the file as the server icon",
    usage: "",
    admin: true,
    tag: "Admin",
    async execute(message, args, Log) {
        const icon = message.attachments.first() ? message.attachments.first().url : null;
        await message.guild.setIcon(icon)
            .then(() => {
                Log.log("seticon | Updated guild icon");
                message.reply("Server icon changed succesfully!");
            })
            .catch(err => {
                Log.error(`seticon | Failed to set new icon | ${err}`);
                message.reply("Error changing the server icon");
            });
    }
};