const Route = require('koa-router');
const route = new Route();

const database = require('../lib/database');
const log = require('../lib/log');

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
    ctx.body = status
    log(status)
    next()
})

route.get('/url',async (ctx,next)=>{
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