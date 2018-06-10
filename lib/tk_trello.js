const rp = require('request-promise-native')
const config = require('../config.tk.json')
const auth = {
    key: config.trello.developer_key,
    token: config.trello.auth_token
}
const { board } = config

const r = rp.defaults({
    baseUrl: 'https://api.trello.com/1/',
    useQuerystring: true,
    json: true,
})

// basic funcs
/* eslint-disable no-unused-vars */
async function _get(endpoint, params) {
    return r({
        url: endpoint,
        qs: Object.assign({}, params, auth)
    });
}

async function _postform(endpoint, params) {
    return r({
        method: 'POST',
        url: endpoint,
        form: Object.assign({}, params, auth)
    });
}

async function _postdata(endpoint, params) {
    return r({
        method: 'POST',
        url: endpoint,
        formData: Object.assign({}, params, auth)
    });
}

async function _put(endpoint, params) {
    return r({
        method: 'PUT',
        url: endpoint,
        form: Object.assign({}, params, auth)
    });
}
/* eslint-enable no-unused-vars */
// end basic funcs

/**
 * getDepartments
 * Return an Array of Departments
 */

async function getDepartments() {
    var lists = await _get(`/boards/${board}/lists`)
    var result = {}
    lists.forEach(item => result[item.id] = item.name)
    return result
}

/**
 * listUserTicket
 * List a user's active tickets
 * @param {User} user 
 */

async function listUserTicket(user) {
    return _get('/search', {
        query: user.id + ' is:open',
        modelTypes: 'cards',
        card_fields: 'name,desc,idList',
        card_list: true
    })
}

/**
 * createTicket
 * Notify Trello to create a new Ticket
 * @param {User} user 
 * @param {String} dept 
 * @param {String} description 
 */

async function createTicket(user, dept, description) {
    const title = [user.id, user.username, user.language_code].join('|')
    var params = {
        name: title,
        desc: description,
        pos: 'top',
        idList: dept,
    }
    return _postform('/cards', params);
}

/**
 * postComment
 * Notify Trello to add a comment
 * @param {Integer} id 
 * @param {String} text 
 */

async function postComment(id, text) {
    return _postform(`/cards/${id}/actions/comments`, { text })
}


module.exports = exports = {
    getDepartments,
    listUserTicket,
    createTicket,
    postComment
}
