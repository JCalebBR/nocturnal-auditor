const Sequelize = require("sequelize");

module.exports = {
    name: "delterm",
    aliases: ["dt", "delt"],
    args: true,
    guildOnly: true,
    description: "Deletes a term",
    usage: "<link/text/attachment> <term>",
    admin: true,
    tag: "Releases",
    async execute(message, args, Log, terms) {

        const type = args[0];
        args.shift();
        const term = args.join(" ");

        const whereClause = {
            [Sequelize.Op.and]: [
                Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("type")), { [Sequelize.Op.like]: `%${type}%` },
                ), Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("term")), { [Sequelize.Op.like]: `%${term}%` },
                )
            ]
        };
        await terms.findAll({ where: whereClause })
            .then(entries => {
                entries.forEach(async entry => {
                    await entry.destroy()
                        .then(message.reply("Term(s) successfully deleted!"))
                        .catch(Log.error);
                });
            });
    }
};