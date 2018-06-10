var storage = {}

function set(k, v) {
    storage[k] = v
    return v
}

function get(k) {
    return storage[k] || false
}

function remove(k) {
    if (delete storage[k]) return true
    else return false
}

function list() {
    return Object.keys(storage)
}

module.exports = exports = {
    get, set, remove, list
}
