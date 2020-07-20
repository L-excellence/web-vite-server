const path = require('path');
const fs = require('fs').promises;
const { resolveVue } = require('./utils');
 
const defaultExportRE = /((?:^|\n|;)\s*)export default/;
 
function vuePlugin({ app, root }) { // ast 语法树 模板的编译原理
    app.use(async (ctx, next) => {
        if (!ctx.path.endsWith('.vue')) { //  当前文件是不是以.vue文件结尾
            return next();
        }
        // vue文件处理
        const filePath = path.join(root, ctx.path);
        const content = await fs.readFile(filePath, 'utf8'); // App.vue中的内容
         
        // 拿到vue的模板编译模块代码，它会导出 parse：解析vue代码、compileTemplate 编译模板 两个方法
        let { parse, compileTemplate } = require(resolveVue(root).compiler);
        let { descriptor } = parse(content); // 解析文件内容
        if (!ctx.query.type) { // ctx.query 是指文件后缀有没有问号（App.vue?）没有？会走到这里，如App.vue
            let code = ``;
            if (descriptor.script) {
                let content = descriptor.script.content;
                // 将.vue文件中的export default 替换为 const __script，其他内容保留
                let replaced = content.replace(defaultExportRE, '$1const __script =');
                code += replaced;
            }
            if (descriptor.template) { // /App.vue?type=template
                const templateRequest = ctx.path + `?type=template`
                code += `\nimport { render as __render } from ${JSON.stringify(
                    templateRequest
                )}`;
                code += `\n__script.render = __render`
            }
            ctx.type = 'js'
            code += `\nexport default __script`;
            ctx.body = code;
        }
        if (ctx.query.type == 'template') {
            ctx.type = 'js';
            let content = descriptor.template.content;
            const { code } = compileTemplate({ source: content });
            ctx.body = code;
        }
    })
}
exports.vuePlugin = vuePlugin;