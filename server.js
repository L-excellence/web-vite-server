const Koa = require('koa');
const { serveStaticPlugin } = require('./plugins/servePluginServeStatic');
const { moduleRewritePlugin } = require('./plugins/servePluginModuleRewrite');
const { moduleResolvePlugin } = require('./plugins/servePluginModuleResolve');
const { htmlRewritePlugin } = require('./plugins/servePluginHtmlRewrite');
const { vuePlugin } = require('./plugins/servePluginVue');

function createServer() {
    const app = new Koa();
    const root = process.cwd(); // 当前执行命令的根目录绝对路径

    const context = { // 每个插件配置参数
        app,
        root
    };
    const resolvePlugins = [ // koa基于插件来完善功能，这里将所有用到的插件统一处理,注意插件顺序，先执行的排在前面
        htmlRewritePlugin, // 解决前段 process 不存在报错问题。
        // 3) 解析import，重写路径,给第三方模块（vue）路径前面增加/@modules 前缀，
        moduleRewritePlugin,
        // 2) 解析以 /@modules 开头的import路径的文件结果
        moduleResolvePlugin,
        vuePlugin,
        // 1) 实现静态服务
        serveStaticPlugin, // 功能：将静态服务读取到的文件结果添加到koa ctx.body 上
    ];
    resolvePlugins.forEach(plugin => plugin(context));
    return app;
}

module.exports = createServer;