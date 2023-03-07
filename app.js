const Koa = require('koa');
const app = new Koa();


app.use(require('koa-bodyparser')())

app.use(async(ctx,next) => {
    await next()
    ctx.res.on('finish',()=>{
        require('./lib/log')(ctx.ip, ctx.method, ctx.url, ctx.response.status, ctx.request.body)
    })
})

app.use(require('koa-static')("public"));

require('require-directory')(module, `${__dirname}/routes`, {
    visit:  (obj) => {
        app.use(obj.routes());
    }
})

app.listen(80, () => {
    console.log('服务启动在 http://127.0.0.1');
});
