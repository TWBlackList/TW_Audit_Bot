function renderIntro() {
    return `歡迎使用台灣聯合回報系統
    
本系統將負責回報使用者申請並且追蹤進度
    
/create - 提交新回報
/list - 查詢所有回報單
/close - 撤銷回報
/cancel - 恢復初始狀態
`
}

function writeHelp(msg, result, bot) {
    if (msg.chat.id > 0){
        bot.sendMessage(msg.chat.id, renderIntro(), {
            reply_to_message_id: msg.message_id,
        })
    }
}

module.exports = exports = {
    run: [
        [/^\/start$/, writeHelp],
        [/^\/help/, writeHelp],
    ]
}
