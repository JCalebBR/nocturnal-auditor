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
        // @ts-ignore
        await fetch(url + params, { Accept: "application/json" })
            .then(response => response.json())
            .then(async response => {
                response.items.forEach(async item => {
                    await client.channel.fetch("894028585336193104")
                        .then(async vcNik => {
                            // Log.debug("Fetched vcNik!");
                            if (item.id == "UCLhcQ0bBZTLipRJ7D42Riow") await vcNik.setName(`🔴 YT: ${Intl.NumberFormat().format(item.statistics.subscriberCount)} subs`).then();
                            else if (item.id == "UCuGrnmTm03ZzoZSyfP-eNJQ") await client.channel.fetch("894028606068650084")
                                .then(async vcClips => {
                                    await vcClips.setName(`🟣 Clips: ${Intl.NumberFormat().format(item.statistics.subscriberCount)} subs`)
                                        .then();
                                });
                        });
                });
            }).catch(console.error);
    }
};