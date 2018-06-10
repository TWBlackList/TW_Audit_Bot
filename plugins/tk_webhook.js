const express = require('express')
const app = express()
const bodyParser = require('body-parser').json({
    strict: false
})
const {
    webhook_port,
    notification
} = require('../config.tk.json')
var bot

app.head('/mainHook', (req, res) => {
    console.log("Rx Trello webhook")
    res.status(200).send('ok').end()
})
/* eslint-disable indent*/
app.post('/mainHook', bodyParser, (req, res) => {
    console.log("Rx Trello webhook")    
    switch (req.body.action.type) {
        case 'createCard':
            createCardProcessor(req)
            break
        case 'commentCard':
            commentCardProcessor(req)
            break
        case 'updateCard':
            if (req.body.action.data.old.idList)
                deptMigrationProcessor(req)
            else if (req.body.action.data.old.closed !== undefined)
                ticketCloseProcessor(req)
            break
            // contains migrate, archive etc    
        case 'addLabelToCard':
            labelAddedProcessor(req)
            break
        case 'removeLabelFromCard':
            labelRemovedProcessor(req)
            break
    }
    res.status(200).send('ok').end()
})
/* eslint-enable indent*/

app.listen(webhook_port)
// HTTP Server Part

// Bot Operation Part
async function commentCardProcessor(req) {
    const comment = req.body.action.data.text
    const card = req.body.action.data.card
    const [user_id, username, language_code] = req.body.action.data.card.name.split('|')
    if (comment.indexOf('[ USER-INPUT ]') == 0) {
        let message = `新動態\n${card.name}\n${req.body.action.data.list.name}\n\n------------\n\n${comment}`
        return bot.sendMessage(notification, message)
    } else {
        const message = `您的回報單 [ #${card.id} ] 有新的動態\n單位: ${req.body.action.data.list.name}\n\n${comment}\n\n您可以直接回覆此則訊息來回應。（如何回覆？雙擊/右鍵/長按此則訊息，選擇 Reply。回覆成功後您會收到訊息。）`
        return bot.sendMessage(user_id, message)
    }
}

async function deptMigrationProcessor(req) {
    const [user_id, username, language_code] = req.body.action.data.card.name.split('|')
    const target_dept = req.body.action.data.listAfter.name
    const message = `您的回報單 [ #${req.body.action.data.card.id} ] 已被轉移到 "${target_dept}" 單位。`
    return bot.sendMessage(user_id, message)
}

async function createCardProcessor(req) {
    let message = `新回報\n${req.body.action.data.card.name}\n${req.body.action.data.list.name}`
    return bot.sendMessage(notification, message)
}

async function ticketCloseProcessor(req) {
    const [user_id, username, language_code] = req.body.action.data.card.name.split('|')
    const card = req.body.action.data.card
    const closed = card.closed
    if (closed === true)
        var message = `您的回報單 [ #${req.body.action.data.card.id} ] 已被關閉。`
    else {
        var message = `您的回報單 [ #${req.body.action.data.card.id} ] 已被重新開啟。`
    }
    return bot.sendMessage(user_id, message)
}

async function labelAddedProcessor(req) {
    const [user_id, username, language_code] = req.body.action.data.card.name.split('|')
    const card = req.body.action.data.card
    const label = req.body.action.data.label.name
    const message = `您的回報單 [ #${card.id} ] 已被註記為 ${label}。`
    return bot.sendMessage(user_id, message)
}

async function labelRemovedProcessor(req) {
    const [user_id, username, language_code] = req.body.action.data.card.name.split('|')
    const card = req.body.action.data.card
    const label = req.body.action.data.label.name
    const message = `您的回報單 [ #${card.id} ] 已被移除標籤 ${label}。`
    return bot.sendMessage(user_id, message)
}

module.exports = exports = {
    init: e => {
        bot = e.bot
    }
}
