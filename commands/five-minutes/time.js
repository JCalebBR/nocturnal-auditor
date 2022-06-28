const fetch = require("node-fetch");
const luxon = require("luxon");

module.exports = {
    name: "time",
    async execute(client, Log) {
        const url = `https://www.timeapi.io/api/TimeZone/zone?`;
        const params = new URLSearchParams({
            "timeZone": `America/Toronto`
        });
        // @ts-ignore
        await fetch(url + params, { Accept: "application/json" })
            .then(response => response.json())
            .then(async response => {
                Log.debug(`${response.currentLocalTime}`);
                const dt = luxon.DateTime.fromISO(response.currentLocalTime);

                const time = dt.toFormat("HH:mm");
                const date = dt.toFormat("dd/LL/yyyy");

                await client.channels.fetch("894028235027923014")
                    .then(async vcTime => {
                        Log.debug("time | Fetched vcTime!");
                        await vcTime.setName(`🕒 ${time} EST`)
                            .then(async () => {
                                Log.debug("time | Updated vcTime name!");
                                await client.channels.fetch("894028280187985991")
                                    .then(async vcDate => {
                                        Log.debug("time | Fetched vcDate!");
                                        await vcDate.setName(`📆 ${date}`)
                                            .then(async () => {
                                                Log.debug("time | Updated vcDate name!");
                                                return;
                                            })
                                            .catch(console.error);
                                    })
                                    .catch(console.error);
                            })
                            .catch(console.error);
                    })
                    .catch(console.error);
            }).catch(console.error);
    }
};