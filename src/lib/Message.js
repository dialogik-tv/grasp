class Message {
    constructor(input) {
        // Remove any HTML tags – and skip message if there is no content left
        this.message = this.sanitizeMessage(input.message);
        
        // Add required attributes
        this.username = input.tags.displayName;
        this.timestamp = input.timestamp;
        this.badges = input.tags.badges;
        this.emotes = input.tags.emotes;

        // Initialize pick and read
        this.pick = false;
        this.read = false;
    }

    sanitizeMessage(message) {
        message = message.replace(/(<([^>]+)>)/ig, '').trim();
        if(message.length < 1) {
            message = '&lt;/&gt;';
        }
        return message;
    }
}

module.exports = Message;
