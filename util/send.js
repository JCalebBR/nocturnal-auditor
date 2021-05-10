const { auditChannel } = require('../config.json');

const send = async (message, data, Log) => {
    await message.client.channels.cache.get(auditChannel).send(data).then(Log.debug(`Data sent successfully!`));

};

exports.send = send;