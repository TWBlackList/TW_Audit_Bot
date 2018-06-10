var _e

const fs = require('fs');

function get_data(){
    let json = fs.readFileSync('config.tk.json');  
    let data = JSON.parse(json);
    return data;
}

function write_data(json){
    let data = JSON.stringify(json);  
    fs.writeFileSync('config.tk.json', data);  
}

async function listTickets(msg, bot) {
    return bot.sendMessage(msg.from.id, message, {
        reply_to_message_id: msg.message_id
    })
}


async function addBL(msg,type,bot){
    let data = get_data();
    if(data.op.indexOf(msg.from.id) < 0){
        return;
    }
    let userid = parseInt(msg.text.toLowerCase().replace("/addbl ",""));
    if(data.bl.indexOf(userid) >= 0){
        bot.sendMessage(msg.from.id, "ID 已在黑名單內");
        return;
    }
    if(userid < 1000000){
        bot.sendMessage(msg.from.id, "請輸入正確的 UserID /addbl UserID");
        return;
    }
    data.bl.push(userid);
    write_data(data);
    bot.sendMessage(msg.from.id, "新增成功!");
    return;
}

async function delBL(msg,type,bot){
    let data = get_data();
    if(data.op.indexOf(msg.from.id) < 0){
        return;
    }
    let userid = parseInt(msg.text.toLowerCase().replace("/delbl ",""));
    if(data.bl.indexOf(userid) < 0){
        bot.sendMessage(msg.from.id, "ID 不在白名單內");
        return;
    }
    if(userid < 1000000){
        bot.sendMessage(msg.from.id, "請輸入正確的 UserID /delbl UserID");
        return;
    }
    var index = data.bl.indexOf(userid);
    if (index > -1) {
        data.bl.splice(index, 1);
    }
    write_data(data);
    bot.sendMessage(msg.from.id, "移除成功!");
    return;
}

async function lsBL(msg,type,bot){
    let data = get_data();
    if(data.op.indexOf(msg.from.id) < 0){
        return;
    }
    bot.sendMessage(msg.from.id, "黑名單 : \n" + data.bl.join("\n"));
    return;
}
	
    
module.exports = exports = {
    init: e => {
        _e = e
    },
    run: [
        [/^\/addbl/, addBL],
		[/^\/delbl/, delBL],
		[/^\/lsbl/, lsBL]
    ]
}
