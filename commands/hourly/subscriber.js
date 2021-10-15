const { apiKeys } = require("../../config.json");
const fetch = require("node-fetch");

module.exports = {
    name: "subscriber",
    async execute(client, Log) {
        const url = "https://www.googleapis.com/youtube/v3/channels?";
        const params = new URLSearchParams({
            "part": "statistics",
            "id": "UCLhcQ0bBZTLipRJ7D42Riow, UCuGrnmTm03ZzoZSyfP-eNJQ",
            "key": apiKeys.youtube
        });

        await fetch(url + params, { Accept: "application/json" })
            .then(response => response.json())
            .then(async response => {
                response.items.forEach(async item => {
                    await client.channels.fetch("894028585336193104")
                        .then(async vcNik => {
                            Log.debug("Fetched vcNik!");

                            if (item.id == "UCLhcQ0bBZTLipRJ7D42Riow") {
                                const nik = `🔴 YT: ${Intl.NumberFormat().format(item.statistics.subscriberCount)} subs`;
                                await vcNik.setName(nik).then(() => Log.debug(`Set clips to: ${nik}`));
                            }
                            else if (item.id == "UCuGrnmTm03ZzoZSyfP-eNJQ") await client.channels.fetch("894028606068650084")
                                .then(async vcClips => {
                                    const clips = `🟣 Clips: ${Intl.NumberFormat().format(item.statistics.subscriberCount)} subs`;
                                    await vcClips.setName(clips)
                                        .then(() => Log.debug(`Set clips to: ${clips}`));
                                });
                        });
                });
            }).catch(console.error);
    }
};