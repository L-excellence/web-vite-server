const { readBody } = require('./utils');
const { parse } = require('es-module-lexer');
const MagicString = require('magic-string');

function rewriteImports(source) {
    // 将文件中所有的import解析成ast语法树，这个语法树有特点，每一项是一个对象，对象中 s 和 e 属性分别表示路径的开始索引和结束索引
    let imports = parse(source)[0]; // 所有静态import语法都放在了数组第一项中: import vue from 'vue' --> [{ s: 17, e: 20 }]
    //console.log(imports);
    let magicString = new MagicString(source); // 将字符串转为对象

    if (imports.length) { // 文件中有import语法
        for (let i = 0; i < imports.length; i ++) {
            let { s, e } = imports[i];
            let id = source.substring(s, e); // vue ./App.vue  source是字符串，s，e是在source中的索引
            // 以 / . 开头的不处理，只给import vue 前面增加/@modules/，标识第三方模块
            if (/^[^\/\.]/.test(id)) {
                id = `/@modules/${id}`; // /@modules/vue
                magicString.overwrite(s, e, id); // 进行重写，开始位置、起始位置、重写的字符串内容
            }

        }
    } 

    return magicString.toString(); // 返回替换后的结果
}

function moduleRewritePlugin({ app, root }) {
    app.use(async (ctx, next) => {
        await next(); // 先执行静态服务插件，之后在执行该插件逻辑
        // 只处理文件中有js相关的文件
        if (ctx.body && ctx.response.is('js')) {
            let content = await readBody(ctx.body); // readBody：以流的方式读取body中的代码
            // console.log(content);
            // 重写import内容。并将重写后的内容进行返回
            const result = rewriteImports(content);
            ctx.body = result;
        }
    });
}

exports.moduleRewritePlugin = moduleRewritePlugin;