const { auditChannel } = require('../config.json');

const send = (message, data) => {
    message.client.channels.cache.get(auditChannel).send(data);
};

exports.send = send;
