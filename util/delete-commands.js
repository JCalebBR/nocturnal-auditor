const path = require("path");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('../config.json');
const fs = require('fs');
const interactionsDirPath = path.resolve(__dirname, "../interactions");
const commands = [];
const commandFiles = fs.readdirSync(interactionsDirPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`${interactionsDirPath}/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.get(Routes.applicationCommands(clientId))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();