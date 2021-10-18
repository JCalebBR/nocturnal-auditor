const luxon = require("luxon");

module.exports = {
    name: "stream",
    async execute(client, Log) {
        await client.channels.fetch("894256720749150229")
            .then(async vcStream => {
                Log.debug("Fetched vcStream!");

                const now = luxon.DateTime.now().toUTC();
                let days = 1;
                if (now.toFormat("E") === "6" && parseInt(now.toFormat("HH")) >= 21) days += 3;
                if (now.toFormat("E") === "7") days += 2;
                if (now.toFormat("E") === "1") days += 1;


                const stream = now.set({ hour: 21, minute: 0, second: 0 }).plus({ days: days }).diff(now, ["days", "hours", "minutes", "seconds"]).toObject();
                const time = `🕙 ${stream.days ? `${stream.days > 1 ? `${stream.days} days` : ""}` : ""} ${stream.hours ? `${stream.hours} hours` : ""} ${stream.minutes ? `${stream.minutes} mins` : ""}`;

                Log.debug(time);
                await vcStream.setName(time)
                    .then(() => Log.debug("Updated vcStream name!"))
                    .catch(Log.error);
            })
            .catch(Log.error);
    }
};