const fs = require('fs/promises')
const log = require('./log');
const Status = require('./status');

const filePath = 'config.json'
let jsonObj = {};

function reload() {
    fs.readFile(filePath).then(data => {
        jsonObj = JSON.parse(data);
        log('成功读取配置文件:', filePath);
    }).catch(err => {
        log(`打开配置文件 ${filePath} 失败:`, err)
    })
}
reload()

module.exports = {
    get:function(key,defaultValue){
        let value = jsonObj?.[key]
        if (value === undefined || value === '') {
            if (defaultValue instanceof Function) {
                value=defaultValue(value)
            }else{
                value = defaultValue
            }
        }
        return value
    },
    set:(key,value)=>{
        jsonObj[key]=value
        fs.writeFile(filePath, JSON.stringify(jsonObj)).then(() => {
            return new Status(0,`${key} <== ${value}`)
        }).catch((err) => {
            return new Status(5,err)
        })
    }
}