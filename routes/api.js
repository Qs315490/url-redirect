const Route = require('koa-router');
const route = new Route();

const database = require('../lib/database');
const log = require('../lib/log');
const jwt = require('jsonwebtoken')
const config = require('../lib/config')

route.prefix('/api')

route.post('/register', async (ctx, next) => {
    const body = ctx.request.body
    const status = await database.addUser(body.name, body.passwd);
    ctx.body = status;
    log(status)
    next()
});

route.post('/login', async (ctx, next) => {
    const body = ctx.request.body
    const status = await database.userLogin(body.name, body.passwd)
    if (status.code === 0) {
        status.data = jwt.sign(status.data, config.get('key', (value) => {
            if (value === undefined || value === "") {
                log('服务器 key 未设置, 使用默认 key: "test". 请及时修改.')
                return 'test'
            }
        }), {
            expiresIn: 24 * 60 * 60 // 24*60*60s = 1d
        })
    }
    ctx.body = status
    log(status)
    next()
})

route.get('/url', async (ctx, next) => {
    const token = ctx.request.query.token
    const status = await database.getUrl(token)
    ctx.body = status
    log(status)
    next()
})

route.post('/url', async (ctx, next) => {
    const body = ctx.request.body
    const status = await database.setUrl(body.uid, body.token, body.url)
    ctx.body = status
    log(status)
    next()
})

module.exports = route;