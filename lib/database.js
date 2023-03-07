const sqlite = require('sqlite3').verbose()
const log = require('./log')
const Status = require('../lib/status')

function errorMsg(errObj, doneMsg) {
    if (errObj) {
        return new Status(1, errObj.message);
    }
    return new Status(0, doneMsg)
}

let db = new sqlite.Database(
    './data.sqlite3',
    sqlite.OPEN_READWRITE,
    (err) => {
        let status = errorMsg(err, '连接数据库成功')
        log(status.msg)
    }
);
process.on('exit', () => {
    db.close((err) => {
        let status = errorMsg(err, '成功关闭数据库')
        log(status.msg)
    })
})

function initDatabase() {
    db.serialize(() => {
        db.run('CREATE TABLE User (UID INTEGER PRIMARY KEY AUTOINCREMENT,Name TEXT,Passwd TEXT)')
        db.run('CREATE TABLE Url (UID INTEGER,Token TEXT,Url TEXT,CONSTRAINT Url_PK PRIMARY KEY (UID,Token))')
        //TODO init
    })
}

async function addUser(name, passwd) {
    return new Promise((resolve) => {
        db.all('SELECT UID FROM "User" WHERE Name = ?', [name], (err, rows) => {
            let status = errorMsg(err)
            if (status.code !== 0) {
                status.msg = `无法查询用户 ${name} 是否存在`
            } else {
                if (rows.length===1) {
                    status = new Status(2, `用户 ${name} 已存在`)
                } else {
                    db.run('INSERT INTO "User" (Name,Passwd) VALUES (?,?)', [name, passwd], async (err) => {
                        status = errorMsg(err, `新用户注册: ${name}`)
                        //TODO send UID
                    })
                }
            }
            resolve(status)
        })
    })
}

function userLogin(name, passwd) {
    return new Promise((resolve) => {
        db.all('SELECT UID,Name FROM "User" WHERE Name = ? AND Passwd = ?', [name, passwd], (err,rows) => {
            let status = errorMsg(err, `用户 ${name} 尝试使用密码 ${passwd} 登录`)
            log(status)
            if (status.code===0) {
                if (rows.length===1) {
                    status=new Status(0,`用户 ${name} 登录成功`)
                    status.data=rows[0]
                }else{
                    status=new Status(2,'用户名或密码错误')
                }
            }
            resolve(status)
        })
    })
}

function getUrl(token) {
    return new Promise((resolve) => {
        db.all('SELECT Url FROM Url WHERE Token = ?', [token], (err, rows) => {
            let status = errorMsg(err, '查询成功')
            if (status.code === 0) {
                if (rows.length === 1) {
                    status.data = rows[0].Url
                } else {
                    status=new Status(3,'链接不存在')
                }
            }
            resolve(status)
        })
    });
}

function setUrl(uid,token, url) {
    return new Promise((resolve) => {
        getUrl(token).then(status => {
            if (status.code === 0 ){
                resolve(new Status(4, `token: ${token} 已经存在`))
            }else if (status.code === 3) {
                db.run('INSERT INTO Url (UID,Token,Url) VALUES (?,?,?)', [uid,token,url], err => {
                    status = errorMsg(err, `${url} 添加成功, Token是 ${token}`)
                    resolve(status)
                })
            } else {
                resolve(status)
            }
        })
    })
}

module.exports = {
    initDatabase,
    addUser,
    userLogin,
    getUrl,
    setUrl
}