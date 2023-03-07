const Route = require('koa-router');
const route = new Route();
const database = require('../lib/database')

route.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    ctx.status = 301;
    const status = await database.getUrl(id);
    if (status.code === 0) {
        ctx.redirect(status.data);
    } else {
        ctx.redirect('/404.html');
    }
});

module.exports = route;