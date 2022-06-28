const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const iconsDirPath = path.resolve(__dirname, "../icons/");

module.exports = {
    name: "randomicon",
    aliases: ["ri", "random"],
    args: false,
    guildOnly: true,
    description: "Sets the file as the server icon",
    usage: "",
    admin: true,
    tag: "Admin",
    async execute(message, args, Log) {
        let icons = new Collection();
        const iconFiles = fs.readdirSync(iconsDirPath).filter(file => file.endsWith(".png") || file.endsWith(".gif"));
        for (const file of iconFiles) {
            icons.set(file, `${iconsDirPath}/${file}`);
        }
        const icon = icons.random();
        await message.guild.setIcon(icon)
            .then(() => {
                Log.log(`seticon | Updated guild icon | ${icon}`);
                message.reply("Server icon changed succesfully!");
            })
            .catch(err => {
                Log.error(`seticon | Failed to set new icon | ${err}`);
                message.reply("Error changing the server icon");
            });
    }
};
