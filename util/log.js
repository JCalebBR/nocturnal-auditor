module.exports = class Log {
    constructor(timestamp = new Date(Date.now())) {
        this.timestamp = timestamp;
        console.log(`-+-+-+-+- ${this.timestamp} | LOG START -+-+-+-+-`);
    };

    debug(message) {
        return console.debug(`${new Date(Date.now())} | DEBUG | ${message}`);
    }

    info(message) {
        return console.info(`${new Date(Date.now())} | INFO | ${message}`);
    }

    log(message) {
        return console.log(`${new Date(Date.now())} | LOG | ${message}`);
    }

    warn(message) {
        return console.warn(`${new Date(Date.now())} | WARN | ${message}`);
    }

    error(message) {
        return console.error(`${new Date(Date.now())} | ERROR | ${message}`);
    }
};