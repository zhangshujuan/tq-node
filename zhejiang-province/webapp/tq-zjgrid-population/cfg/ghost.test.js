var log4js = require('log4js');

log4js.loadAppender("dateFile");
log4js.addAppender(log4js.appenderMakers['dateFile']({  
    filename:"/workspace/tq/nodejs/log/tq-zjgrid-population.log",  
    pattern: '.yyyy-MM-dd',alwaysIncludePattern: true,  
    layout: {
        type: 'pattern',
        pattern: '[%d %p %c] %m%n'
    }  
}), 'tq-zjgrid-population'); 

module.exports = {
    getLogger:function() {
        return log4js.getLogger('tq-zjgrid-population');
    },
    http:{
        app:{
            pref: '/app/public',
            addr: 'dev.zudeapp.com',
            port: 80
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
    cenv: 'test',
    dscm: {
        //qc-dc-ceter
       dccr: {
            addr: "172.19.240.52",
            port: 5524
        },
        //qc-pay-ceter
        pycr: {
            addr: "192.168.0.72",
            port: 5525
        },
        //qc-rm-gate
        rmcr: {
            addr: "192.168.0.72",
            port: 5526
        }
    }    
}