class Grasp {
    grasp(message, chatcount) {
        const grasp = {
            isGrasp: false,
            details: {
                mention: false,
                chatcount: false,
                haystack: false,
                shorty: false,
                mod: false,
                sub: false,
                vip: false,
                redemption: false,
                command: false
            }
        }

        // Let's make sure this is not a message addressed to someone else
        if(
            message.message.startsWith('@')
            && !message.message.toLowerCase().startsWith(`@${this.config.channel.toLowerCase()}`)
            && !message.message.toLowerCase().includes(`@${this.config.channel.toLowerCase()}`)
        ) {
            // Skip (return initialized object)
            return grasp;
        }
        
        // Is the broadcaster adressed directly?
        if(message.message.toLowerCase().includes(`@${this.config.channel.toLowerCase()}`)) {
            grasp.details.mention = true;
            grasp.isGrasp = true;
        }

        // Is the user new to the chat (first two messages)
        if(chatcount < 3) {
            grasp.details.chatcount = chatcount;
            grasp.isGrasp = true;
        }

        // Are there some short greetings like `hi`, `hallo`, `hey`
        if(this.searchShorties(message.message)) {
            grasp.details.shorty = true;
            grasp.isGrasp = true;
        }
        
        // Search the haystack for some needles like
        // `good morning` in `I wish a <good morning> to everyone`
        if(this.searchNeedles(message.message)) {
            grasp.details.haystack = true;
            grasp.isGrasp = true;
        }
        
        // Mod?
        if(message.tags.mod == 1) {
            grasp.details.mod = true;
            grasp.isGrasp = true;
        }
        
        // Sub?
        if(message.tags.subscriber == 1) {
            grasp.details.sub = true;
            grasp.isGrasp = true;
        }
        
        // VIP?
        if(message.tags.badges.vip == 1) {
            grasp.details.vip = true;
            grasp.isGrasp = true;
        }
        
        // Is input text of a redemption?
        if(message.tags.customRewardId) {
            grasp.details.redemption = true;
            grasp.isGrasp = true;
        }

        // Is message a `!command`?
        if(message.message.startsWith('!')) {
            grasp.command = true;
        }

        return grasp;
    }
}

const instance = new Grasp();
module.exports = instance;