module.exports = {
    name: "members",
    async execute(client, Log) {
        await client.guilds.fetch("384935929791512577")
            .then(async guild => await guild.members.fetch()
                .then(async members => {
                    const vcMember = await client.channels.fetch("894028298009587752");
                    await vcMember.setName(`🍎 ${members.size} CoreKids`)
                        .then(() => Log.debug(`vcMember is set`));

                    const vcMemberStatus = await client.channels.fetch("894028318502965258");
                    const online = members.filter((m) => m.presence?.status === "online").size;
                    const dnd = members.filter((m) => m.presence?.status === "dnd").size;
                    const idle = members.filter((m) => m.presence?.status === "idle").size;
                    await vcMemberStatus.setName(`🟢 ${online} | ⛔ ${dnd} | 🌙 ${idle}`);
                    return;
                })
                .catch(Log.error)
            )
            .catch(Log.error);
    }
};