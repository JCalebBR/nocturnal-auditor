const { auditChannel } = require('../config.json');

const send = async (message, data) => {
    await message.client.channels.cache.get(auditChannel).send(data);
};

exports.send = send;
