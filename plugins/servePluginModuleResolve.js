const fs = require('fs').promises;
const moduleReg = /^\/@modules\//;
const { resolveVue } = require('./utils');

function moduleResolvePlugin({ app, root }) {

    const vueResolved = resolveVue(root); // 根据当前运行vite的目录解析出vue的文件表

    app.use(async (ctx, next) => {
        if (!moduleReg.test(ctx.path)) { // 处理当前请求的路径，是否以/@modules/开头，不是不进行处理，跳过
            return next();
        }
        const id = ctx.path.replace(moduleReg, ''); // /@modules/vue --> vue
        ctx.type = 'js';
        ctx.body = await fs.readFile(vueResolved[id], 'utf8'); // 去当前项目下查找真实的vue文件并返回
    });
}

exports.moduleResolvePlugin = moduleResolvePlugin;