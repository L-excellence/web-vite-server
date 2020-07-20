// 静态服务
const static = require('koa-static');
const path = require('path');

function serveStaticPlugin({ app, root }) {
    // 静态服务可以创建多个，先找根目录，有没有index.html，没有会去public下查找
    app.use(static(root)); // 将运行命令的根目录作为静态服务目录
    app.use(static(path.join(root, 'public'))); // 将根目录下public目录也作为根目录
}

exports.serveStaticPlugin = serveStaticPlugin;