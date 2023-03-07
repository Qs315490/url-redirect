
function log() {
    const time = new Date();
    date = `${time.getFullYear()}/${time.getMonth()}/${time.getDay()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
    return console.log(date, ...arguments)
}

module.exports = log