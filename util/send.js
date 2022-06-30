const { auditChannel } = require('../config.json');

const send = async (message, data, Log) => {
    try {
        await message.client.channels.cache.get(auditChannel[message.guildId]).send(data).then(Log.debug(`Data sent successfully!`));
    } catch (error) {
        Log.error(`Error when sending | ${error}`);
        Log.debug(`Attempting alternate method...`);
        await message.client.channels.cache.get(auditChannel[message.guild.id]).send(data).then(Log.debug(`Data sent successfully!`));
    }

};

exports.send = send;