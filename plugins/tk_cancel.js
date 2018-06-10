var _e, _storage, _trello
const regTicketId = /\[\s#([0-9a-z]{24})\s\]/

function checkLock(uid) {
    return _storage.get(`${uid}:locked`) ? true : false
}

function setLock(uid, isLocked) {
    return _storage.set(`${uid}:locked`, isLocked)
}

function getState(uid) {
    return _storage.get(`${uid}:state`)
}

function setState(uid, state) {
    return _storage.set(`${uid}:state`, state)
}

function cancelProcessor(msg, type, bot) {
    if (msg.chat.id > 0) {
        setLock(msg.from.id, false)
        setState(msg.from.id, false)
        return bot.sendMessage(msg.from.id, '已恢復初始狀態。', {
            reply_to_message_id: msg.message_id,
            reply_markup: {
                remove_keyboard: true
            }
        })
    }
}

module.exports = exports = {
    init: e => {
        _e = e
        _storage = _e.libs['tk_storage']
        _trello = _e.libs['tk_trello']
    },
    run: [
        [/^\/cancel/, cancelProcessor]
    ]
}
