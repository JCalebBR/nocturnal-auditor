const { Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const iconsDirPath = path.resolve(__dirname, "../../icons/");

module.exports = {
    name: "randomicon",
    async execute(client, Log) {
        let icons = new Collection();
        const iconFiles = fs.readdirSync(iconsDirPath).filter(file => file.endsWith(".png") || file.endsWith(".gif"));
        for (const file of iconFiles) {
            icons.set(file, `${iconsDirPath}/${file}`);
        }
        const icon = icons.random();
        await client.guilds.fetch("384935929791512577")
            .then(async guild => {
                await guild.setIcon(icon)
                    .then(() => Log.log(`randomicon | Updated guild icon | ${icon}`))
                    .catch(err => Log.error(`randomicon | Failed to set new icon | ${err}`));
            })
            .catch(err => Log.error(`randomicon | Failed to fetch guild| ${err}`));
    }
};