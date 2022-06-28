const { events } = require("../config.json");
module.exports = class EmbedBuilder {
    constructor(event, message, newMessage = null, executor = null) {
        this.event = event;
        this.message = message;
        this.newMessage = newMessage;
        this.executor = executor;

        //Embed
        this.color = events[this.event].color;
        this.author = {
            name: this.event,
            icon_url: events[this.event].url
        };
        this.description = this.setDescription();
        this.timestamp = new Date();
        this.footer = {
            text: this.event,
            icon_url: events[this.event].url
        };
        this.images = null;
    };

    setDescription() {
        if (this.event === "MESSAGE DELETED") return this.messageDeleted(this.message);
        else if (this.event === "MESSAGE UPDATED") return this.messageUpdated(this.message, this.newMessage);
        else if (this.event === "THREAD CREATED") return this.threadCreated(this.message);
        else if (this.event === "THREAD UPDATED") return this.threadUpdated(this.message, this.newMessage);
        else if (this.event === "THREAD DELETED") return this.threadDeleted(this.message);
        else if (this.event === "GUILD MEMBER ADDED") return this.guildMemberAdd(this.message);
        else if (this.event === "GUILD MEMBER REMOVED") return this.guildMemberRemove(this.message);
        else if (this.event === "GUILD MEMBER UPDATED") return this.guildMemberUpdate(this.message);
        else if (this.event === "GUILD BAN ADDED") return this.guildBanAdd(this.message);
        else if (this.event === "GUILD BAN REMOVED") return this.guildBanRemove(this.message);
        else return `UNKNOWN EVENT`;
    };

    messageDeleted(message) {
        let description = `
            **Executor : ** ${this.executor} - ${this.executor.tag}
            **Author : ** ${message.author} - ${message.author.tag}
            **Channel : ** ${message.channel}
            **Date : ** ${message.createdAt}`;

        if (message.content) description += `\n\n**Deleted message : ** \`\`\`${message.content.replace(/`/g, "'")}\`\`\``;
        if (message.attachments.size > 0) description += `\n**Attachments: ** ${message.attachments.map(x => x.proxyURL)}`;

        return description;
    };

    messageUpdated(message, newMessage) {
        let description = `
            **Author : ** ${message.author} - ${message.author.tag}
            **Channel : ** ${message.channel}
            **Date : ** ${message.createdAt}`;
        if (!message.content || !newMessage.content) {
            description += `\n**Original or Edited Message too big, I"m lazy!**`;
        } else {
            description += `
            **Original message : ** \`\`\`${message.content.replace(/`/g, "'")}\`\`\`
            **Edited message : ** \`\`\`${newMessage.content.replace(/`/g, "'")}\`\`\``;
        }
        if (message.attachments.size > 0) description += `\n**Original attachments: ** ${message.attachments.map(x => x.proxyURL)}`;
        if (newMessage.attachments.size > 0) description += `\n**New attachments: ** ${newMessage.attachments.map(x => x.proxyURL)}`;

        this.timestamp = newMessage.createdAt;
        return description;
    }

    threadCreated(thread) {
        let description = `
            **Creator : ** <@${thread.ownerId}>
            **Thread Creation : ** ${new Date(thread.createdTimestamp)}
            **Parent Channel : ** ${thread.parent}
            **Thread Name : ** \`${thread.name}\`
            **Thread Type : ** \`${thread.type === "GUILD_PRIVATE_THREAD" ? "Private" : "Public"}\``;
        return description;
    }

    threadUpdated(thread, newThread) {
        let description = `
            **Creator : ** <@${thread.ownerId}>
            **Thread Creation : ** ${new Date(thread.createdTimestamp)}
            **Parent Channel : ** ${thread.parent}`;

        if (thread.name !== newThread.name) {
            description += `
            **Old Thread Name : ** \`${thread.name}\`
            **New Thread Name : ** \`${newThread.name}\``;
        }

        if (thread.archived !== newThread.archived) {
            description += `
            **Thread Status: ** ${newThread.archived ? 'Archived' : 'Unarchived'}`;
        }
        return description;
    }

    threadDeleted(thread) {
        let description = `
            **Creator : ** <@${thread.ownerId}>
            **Thread Creation : ** ${new Date(thread.createdTimestamp)}
            **Parent Channel : ** ${thread.parent}
            **Thread Name : ** \`${thread.name}\`
            **Thread Status: ** \`${thread.archived ? 'Archived' : 'Unarchived'}\``;
        return description;
    }

    guildMemberAdd(message) {
        this.thumbnail = {
            url: message.user.displayAvatarURL()
        };
        this.author = {
            name: `BORDER ENTRY : ${message.user.tag}`,
            icon_url: events[this.event].url
        };
        this.timestamp = new Date();
        return `
            **Border Crosser : ** ${message.user} - ${message.user.tag}
            **User born on : ** ${new Date(message.user.createdTimestamp).toDateString()}
            **Date of entry: ** ${this.timestamp}`;

    }
    guildMemberRemove(message) {
        this.thumbnail = {
            url: message.user.displayAvatarURL()
        };
        this.author = {
            name: `BORDER LEAVE : ${message.user.tag}`,
            icon_url: events[this.event].url
        };
        this.timestamp = new Date();
        return `
            **Border Crosser : ** ${message.user} - ${message.user.tag}
            **User born on : ** ${new Date(message.user.createdTimestamp).toDateString()}
            **Date of leave: ** ${this.timestamp}`;
    }
    guildMemberUpdate(oldMember) {
        this.thumbnail = {
            url: oldMember.user.displayAvatarURL()
        };
        this.author = {
            name: `BORDER PASS UPDATED : ${oldMember.user.tag}`,
            icon_url: events[this.event].url
        };
        this.timestamp = new Date();
        return `
            **Border Crosser : ** ${oldMember.user} - ${oldMember.user.tag}
            **User born on : ** ${new Date(oldMember.user.createdTimestamp).toDateString()}
            **Accepted the rules? : ** ${!oldMember.pending}`;
    }
    guildBanAdd(message) {
        this.thumbnail = {
            url: message.user.displayAvatarURL()
        };
        this.author = {
            name: `BAN ADDED : ${message.user.tag}`,
            icon_url: events[this.event].url
        };
        this.timestamp = new Date();
        return `
            **Border Crosser : ** ${message.user} - ${message.user.tag}
            **User born on : ** ${new Date(message.user.createdTimestamp).toDateString()}
            **Date of ban: ** ${this.timestamp}
            **Reason: ** ${message.reason || "None provided"}`;
    }
    guildBanRemove(message) {
        this.thumbnail = {
            url: message.user.displayAvatarURL()
        };
        this.author = {
            name: `BAN REMOVED : ${message.user.tag}`,
            icon_url: events[this.event].url
        };
        this.timestamp = new Date();
        return `
            **Border Crosser : ** ${message.user} - ${message.user.tag}
            **User born on : ** ${new Date(message.user.createdTimestamp).toDateString()}
            **Date of unban: ** ${this.timestamp}`;
    }
};