/**
 * 入口
 */
var http = require('http');
var express = require('express');//https://www.expressjs.com.cn/4x/api.html#app
var cluster = require('cluster');//单个 Node.js 实例运行在单个线程中。 为了充分利用多核系统，有时需要启用一组 Node.js 进程去处理负载任务。cluster 模块可以创建共享服务器端口的子进程。http://nodejs.cn/api/cluster.html
var graceful = require('graceful');//Node.js 异步异常的处理与domain模块解析 https://www.npmjs.com/package/graceful
var bodyParser = require('body-parser'); //Express框架默认使用body-parser作为请求体解析中间件
var session = require('express-session');//https://www.jianshu.com/p/cd3de110b4b6
var cookieParser = require('cookie-parser');//方便操作客户端中的cookie值。 https://www.jianshu.com/p/7fc30d77cc5c

var conf = require('./sdcm.conf.js');//基本配置
var logj = require('./sdcm.logj.js');//日志输出文件配置
var code = require('./sdcm.code.js');//code
var form = require('./sdcm.form.js');//form
var file = require('./sdcm.file.js');//file
var html = require('./sdcm.html.js');//html
var cacl = require('./sdcm.cacl.js');
var ccps = require('./sdcm.ccps.js');

var numCPUs = require('os').cpus().length;
var cach = require('./sdcm.cach.js')();

//const easyMonitor = require('easy-monitor');
//easyMonitor('api');

var cache = new cach(conf.cach);
var sess = session({
    store: cache,
    saveUninitialized: false,
    secret: conf.sess.key,
    name: conf.sess.name,
    resave: true,
    cookie: {
        maxAge: conf.sess.time
    }
})

function createSdcmObject() {
    var app = express();
    // Set case sensitive routing for Windows development environment.
    if (conf.debug)
        app.set('case sensitive routing', true);

    app.use(sess);
    cache.replaceGenerate();

    app.use(cookieParser(conf.sess.key));
    //解析文本格式
    app.use(bodyParser.urlencoded({ 
        extended: true 
    }));
    // 解析解析JSON格式application/json
    app.use(bodyParser.json());
    // 解析 application/x-www-form-urlencoded
    // app.use(bodyParser.urlencoded());
    // 解析二进制格式 自定义的 Buffer
    app.use(bodyParser.raw({ 
        type: 'text/xml'
    }));
    app.use('*.cci', cacl, code);
    app.use('*.cgi', cacl, form);
    app.use('*.cfi', cacl, file);
    app.use('*.htm', cacl, html);
    app.use(express.static(conf.dcfg)); 
    return app; 

}

if (!conf.cluster) {
    var app = createSdcmObject();
    if(conf.ccps && conf.ccps.enabled){
        ccps(app.listen(conf.httpport), sess);
    } else {
        app.listen(conf.httpport);
    }

    console.log('[%s] [worker:%d] Server started, listen at %d', new Date(), process.pid, conf.httpport);
    logj.logger().info('[worker:%d] Server started, listen at %d', process.pid, conf.httpport);

    graceful({
        server: [app],
        error: function (err, throwErrorCount) {
            if (err.message) {
                err.message += ' (uncaughtException throw ' + throwErrorCount + ' times on pid:' + process.pid + ')';
            }

            console.error("[%s] [worker:%d] stack [%s] err[%s]"+err.stack,new Date(), process.pid, err.stack, err);
            logj.logger().error('[worker %d failed], stack [%s] err[%s]', process.pid, err.stack, err);
        }
    });
} else {
    if (cluster.isMaster) {
        console.log('[%s] [master:%d] Master started, listen at %d', new Date(), process.pid, conf.httpport);
        logj.logger().info('[master:%d] Master started, listen at %d', process.pid, conf.httpport);

        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
   
        cluster.on('listening', function (worker, address) {
            console.log('[listening] worker id=%d,pid=%d, port=%d', worker.id ,worker.process.pid, address.port);
            logj.logger().info('[listening] worker id=%d,pid=%d, port=%d', worker.id ,worker.process.pid, address.port);
        });
   
    } else if (cluster.isWorker) {
        var app = createSdcmObject();
        if(conf.ccps && conf.ccps.enabled){
            ccps(app.listen(conf.httpport), sess);
        } else {
            app.listen(conf.httpport);
        }
        console.log('[worker:%d] Worker started, listen at %d', cluster.worker.id, conf.httpport);
        logj.logger().info('[worker:%d] Worker started, listen at %d', cluster.worker.id, conf.httpport);
    }
}