var _e, _storage, _trello, cache_department
const {
    err_report
} = require('../config.tk.json')

const fs = require('fs');

function get_data(){
    let json = fs.readFileSync('config.tk.json');  
    let data = JSON.parse(json);
    return data;
}

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

/**
 * stageI
 * Select Department
 * @param {Message} msg 
 * @param {TelegramBot} bot 
 */
async function stageI(msg, bot) {
    try {
        setLock(msg.from.id, true)
        setState(msg.from.id, {
            state: 'selectDepartment'
        })
        const message = `您正在新建回報。\n\n請選擇受理單位：`
        const departments = await _trello.getDepartments()
        cache_department = departments
        let keyboard = []
        Object.values(departments).forEach(dept => {
            keyboard.push([{
                text: dept
            }])
        })
        return await bot.sendMessage(msg.from.id, message, {
            reply_to_message_id: msg.message_id,
            reply_markup: {
                keyboard,
                one_time_keyboard: true
            }
        })
    } catch (e) {
        return await bot.sendMessage(err_report, e)
    }
}

/**
 * stageII
 * Verify Department and Ask Description
 * @param {Message} msg 
 * @param {TelegramBot} bot 
 */
async function stageII(msg, bot) {
    const user_input = msg.text
    if (Object.values(cache_department).indexOf(user_input) > -1) {
        const selected_department = Object.keys(cache_department)[Object.values(cache_department).indexOf(user_input)]
        setState(msg.from.id, {
            state: 'fillDescription',
            selected_department
        })
        const { descs } = await _trello.getFirstCardDesc(selected_department);
        let message = "";
        descs.forEach(desc => {
            message += `${card.desc}\n`
        });
        message += "\n請輸入要回報的內容(圖片請使用外連) : ";
        return await bot.sendMessage(msg.from.id, message, {
            reply_to_message_id: msg.message_id,
            reply_markup: {
                remove_keyboard: true
            }
        })
    } else {
        // Selected Department is Invalid
        const message = '您選擇的受理單位無效，請重新選擇。'
        return await bot.sendMessage(msg.from.id, message, {
            reply_to_message_id: msg.message_id
        })
    }
}

/**
 * stageIII
 * Collect Description and Create Ticket
 * @param {Message} msg 
 * @param {TelegramBot} bot 
 */
async function stageIII(msg, bot) {
    const description = msg.text
    const {
        selected_department
    } = getState(msg.from.id)
    const {
        id,
        name,
        url
    } = await _trello.createTicket(msg.from, selected_department, description)
    const message = `已提交回報。\n\n追蹤編號: [ #${id} ]\n受理單位: ${cache_department[selected_department]}\n回報內容：\n${description}\n\n現在您可以回覆此則訊息以追加更多內容。（如何回覆？雙擊/右鍵/長按此則訊息，選擇 Reply。回覆成功後您會收到訊息。）\n小訣竅：點擊追蹤編號可以查詢此次回報的所有消息。`
    // Job is done. Let's purge state.
    setState(msg.from.id, false)
    setLock(msg.from.id, false)
    return await bot.sendMessage(msg.from.id, message, {
        reply_to_message_id: msg.message_id
    })
}

async function processCreate(msg, result, bot) {
    if(get_data().bl.indexOf(msg.from.id) >= 0){
        return;
    }
    const state = getState(msg.from.id)
    if (msg.chat.id > 0)
        if (!state && !checkLock(msg.from.id))
            stageI(msg, bot)
}

async function stageSelector(msg, type, bot) {
    if(get_data().bl.indexOf(msg.from.id) >= 0){
        return;
    }
    if (msg.text[0] == '/') return
    if (msg.chat.id > 0 && checkLock(msg.from.id)) {
        const state = getState(msg.from.id)
        if (state['state'] == 'selectDepartment')
            stageII(msg, bot)
        else if (state['state'] == 'fillDescription')
            stageIII(msg, bot)
    }
}

module.exports = exports = {
    init: e => {
        _e = e
        _storage = _e.libs['tk_storage']
        _trello = _e.libs['tk_trello']
    },
    run: [
        [/^\/create/, processCreate],
        ['text', stageSelector]
    ]
}
