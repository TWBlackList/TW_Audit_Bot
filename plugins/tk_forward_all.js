const {
    notification
} = require('../config.tk.json')

async function textProcessor(msg, type, bot) {
    bot.forwardMessage(notification,msg.from.id,msg.message_id)
}

module.exports = exports = {
    run: [
        ['text', textProcessor]
    ]
}
