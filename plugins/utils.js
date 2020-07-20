const { Readable } = require('stream');
const path = require('path');

async function readBody(stream) {
    if (stream instanceof Readable) {
        // koa 中要求所有的异步方法都包装成Promise
        return new Promise((resolve, reject) => {
            let res = '';
            stream.on('data', data => {
                res += data;
            });
            stream.on('end', () => {
                resolve(res);
            });
        });
    } else {
        return stream;
    }
    
}

function resolveVue(root) {
    // vue3 组成部分：runtime-dom runtime-core reactivity shared compiler-sfc(这个用于后端解析.vue文件)
    
    // 编译是在node中实现的，所以我们要拿到compiler-sfc的路径
    const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json');
    const compilerPkg = require(compilerPkgPath); // 拿到package.json文件内容
    const compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main);

    const resolvePath = name => path.resolve(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`);

    const runtimeDomPath = resolvePath('runtime-dom');
    const runtimeCorePath = resolvePath('runtime-core');
    const reactivityPath = resolvePath('reactivity');
    const sharedPath = resolvePath('shared');

    return {
        compiler: compilerPath, // 用于稍后在node后端进行编译文件的路径
        '@vue/runtime-dom': runtimeDomPath,
        '@vue/runtime-core': runtimeCorePath,
        '@vue/reactivity': reactivityPath,
        '@vue/shared': sharedPath,
        vue: runtimeDomPath, // 引入vue和runtime-dom是一样的
    };
}

exports.readBody = readBody;
exports.resolveVue = resolveVue;