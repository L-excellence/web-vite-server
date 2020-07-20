const { readBody } = require('./utils');
function htmlRewritePlugin({ app, root }) {
    const inject = `
        <script>
            window.process = {};
            process.env = { NODE_ENV: 'development' }
        </script>
    `;
    app.use(async (ctx, next) => {
        await next();
        if (ctx.response.is('html')) {
            const html = await readBody(ctx.body);
            // 在head标签内部增加script脚本来解决process不存在问题，$&表示保留替换内容<head>
            ctx.body = html.replace(/<head>/, `$&${inject}`);
        }
    });
}

exports.htmlRewritePlugin = htmlRewritePlugin;