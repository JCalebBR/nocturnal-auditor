const { pngs } = require("../config.json");
const Sequelize = require("sequelize");

module.exports = {
    name: "getterms",
    aliases: ["gt", "gett", "list"],
    args: false,
    guildOnly: true,
    description: "Gets all banned terms",
    usage: "",
    admin: true,
    tag: "Filter",
    async execute(message, args, Log, terms) {

        let embed = {
            color: 0xff0000,
            description: "",
            title: "Banned Terms List",
            author: { icon_url: pngs.auditor.avatar },
            fields: [],
            thumbnail: { url: "" }
        };

        const arg = args.join(" ");
        let type;
        if (args.length == 0)
            type = "";
        else if (arg == "link")
            type = "link";
        else if (arg == "attachment" || arg == "image" || arg == "video")
            type = "attachment";
        else if (arg == "text")
            type = "text";

        const whereClause = {
            [Sequelize.Op.and]: [
                Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("type")), { [Sequelize.Op.like]: `%${type}%` },
                )
            ]
        };

        await terms.findAll({ order: [["type", "ASC"], ["term", "ASC"]] })
            .then(data => {
                if (!data.length) embed.description += `No terms found!`;
                else {
                    data.forEach((term, index) => {
                        term = term.dataValues;
                        console.log(term, index);
                        embed.description += `${index + 1}. ${term.type} | ${term.term}\n`;
                    });
                }
            })
            .catch(Log.error);
        console.log(embed);
        return message.reply({ embeds: [embed] });
    }
};