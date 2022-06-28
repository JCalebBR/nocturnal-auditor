const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const iconsDirPath = path.resolve(__dirname, "../icons/");

module.exports = {
    name: "addicon",
    aliases: ["ai", "addi"],
    args: false,
    guildOnly: true,
    description: "Sets the file as the server icon",
    usage: "",
    admin: true,
    tag: "Admin",
    async execute(message, args, Log) {
        const icon = message.attachments.first();
        //@ts-ignore
        await fetch(icon.url)
            .then(res => new Promise((resolve, reject) => {
                const dest = fs.createWriteStream(`${iconsDirPath}/${icon.name}`);
                res.body.pipe(dest);
                res.body.on("end", () => resolve(`addicon | Added new image | ${icon.name}`));
                dest.on("error", reject);
            }))
            .then(x => {
                Log.log(x);
                message.reply("Added image to the rotation!");
            })
            .catch(err => {
                Log.error(err);
                message.reply("Error adding image!");
            });
    }
};