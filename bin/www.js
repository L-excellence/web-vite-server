#! /usr/bin/env node

// 创建一个http服务，基于koa来创建
const createServer = require('../server');
createServer().listen(4000, () => {
    console.log('server statt 400 port', 'http://localhost:4000');
})