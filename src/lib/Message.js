class Message {
    constructor(input) {
        // Remove any HTML tags – and skip message if there is no content left
        this.message = this.sanitizeMessage(input.message);

        // Initialize pick and read
        this.pick = false;
        this.read = false;
    }
}

module.exports = Message;