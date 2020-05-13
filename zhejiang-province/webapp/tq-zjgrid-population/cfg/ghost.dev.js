var log4js = require('log4js');

log4js.loadAppender("dateFile");
log4js.addAppender(log4js.appenderMakers['dateFile']({  
    filename:"/workspace/tq/nodejs/log/tq-zjgrid-population.log",  
    pattern: '.yyyy-MM-dd.log',alwaysIncludePattern: true,  
    layout: {
        type: 'pattern',
        pattern: '[%d %p %c] %m%n'
    }  
}), 'tq-zjgrid-population'); 

module.exports = {
    getLogger:function() {
        return log4js.getLogger('tq-zjgrid-population');
    },
    http: {
        app:{
            pref: '/doraemon-auth',
            addr: '192.168.110.197',
            port: 8081
        },
        //实有人口
        population: {
            addr: "192.168.110.124",
            port: 3080
        },
        //组织场所
        institution: {
            addr: "192.168.110.124",
            port: 1080
        },
        res:{
            addr: 'res.zudeapp.com',
            port: 80
        },
        oss:{
            addr: 'baizu-res.oss-cn-shanghai.aliyuncs.com',
            port: 80
        }  
    },
    cenv: 'dev',
    dscm: {
        
    }
}