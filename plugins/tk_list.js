var _e, _storage, _trello

function checkLock(uid) {
    return _storage.get(`${uid}:locked`) ? true : false
}

async function listTickets(msg, bot) {
    const data = await _trello.listUserTicket(msg.from)
    const cards = data.cards;
    let message = ''
    if (cards.length == 0) {
        message = '您沒有處理中的回報單'
    } else {
        cards.forEach(card => {
            message += `追蹤編號 #${card.id}:\n--受理單位: ${card.list.name}\n--回報內容: ${card.desc}\n\n`
        })
    }
    return bot.sendMessage(msg.from.id, message, {
        reply_to_message_id: msg.message_id
    })
}

function listTicketsProcessor(msg, type, bot) {
    if (msg.chat.id > 0 && !checkLock(msg.from.id))
        listTickets(msg, bot)
}
    
module.exports = exports = {
    init: e => {
        _e = e
        _storage = _e.libs['tk_storage']
        _trello = _e.libs['tk_trello']
    },
    run: [
        [/^\/list/, listTicketsProcessor]
    ]
}
