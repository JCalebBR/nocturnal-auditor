const path = require('path');
const fileName = path.resolve('./config.json');
const fs = require('fs');

module.exports = {
    name: 'audit',
    args: false,
    guildOnly: true,
    description: 'Sets the default channel to post audit logs',
    usage: 'optional: <channel>',
    admin: true,
    execute(message, args) {
        message.channel.send("Trying...")
            .then(message => {
                fs.readFile(fileName, (err, data) => {
                    if (err) throw err;

                    let json = JSON.parse(data);
                    let channel;
                    let response;
                    console.log(json);
                    if (!args.length) {
                        response = `Current audit channel is <#${json.auditChannel || 'None'}>`;
                        message.delete({ timeout: 100 }).then(message.channel.send(response));
                    } else if (args[0] === 'reset') {
                        json.auditChannel = "";
                        response = "Audit channel reset.";
                        writeFile(fileName, json, message, channel, response);
                    } else {
                        channel = args[0].replace(/[^\w\s]/gi, "");
                        json.auditChannel = `${channel}`;
                        response = `Done! Audit channel set to <#${channel}>.`;
                        writeFile(fileName, json, message, response);
                    }
                    console.log(channel);
                });
            })
            .catch(err => console.log(err));
    }
};

function writeFile(fileName, json, message, channel, response) {
    json = JSON.stringify(json, null, 2);
    fs.writeFile(fileName, json, (err) => {
        if (err) throw err;
        message.delete({ timeout: 100 }).then(message.channel.send(response));
        message.client.channels.cache.get(channel).send("test");
    });
}