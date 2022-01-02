const Sequelize = require("sequelize");

module.exports = {
    name: "addterm",
    aliases: ["at", "addt"],
    args: true,
    guildOnly: true,
    description: "Adds a term to the banned terms list",
    usage: "<link/text/attachment>",
    admin: true,
    tag: "Filter",
    async execute(message, args, Log, terms) {
        let term = args.join(" ").toLowerCase();
        const regex = /[a-zA-Z0-9-]*\.[a-zA-Z0-9-]*/g;
        let type;
        if (term.match(regex)) {
            term = term.match(regex).join(" ");
            type = "link";
        } else if (term.includes(".png") || term.includes(".webm") || term.includes(".mp4")) {
            type = "attachment";
        } else {
            type = "text";

        }

        console.log(term, type);
        await terms.create({
            type: type,
            term: term,
        })
            .then(data => {
                message.reply(`Term added!\nThis is what I got from you: \`${data.type}\`,\`${data.term}\``);
                Log.debug(`Added ${data.type} ${data.term} to the db by ${message.author}`);
            })
            .catch(e => {
                if (e instanceof Sequelize.ValidationError) {
                    Log.error(`${message.author} tried to add an already existing term`);
                    message.reply("That term already exists!");
                }
                else {
                    Log.error(e);
                    throw new Error;
                }
            });
    }
};