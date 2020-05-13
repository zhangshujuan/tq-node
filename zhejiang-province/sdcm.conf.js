/**
 * conf基础配置
 */
var path = require('path');

var config  = {   
    cluster: false,//是否运行在集群模式
    httpport: 8001,//服务启动在哪个端口
    timeout: 20000,//调用后端服务的超时时间，单位ms
    umfs: 209715200,//上传文件总大小上限2m(2 * 1024 * 1024)
    debug: true, 
    ctcp: true, //是否启动websocket
    ldir: '/workspace/tq/nodejs/log', //日志文件目录  
    fext: {
        'jpg': true,
        'jpeg': true,
        'png': true,
        'webm': true,
        'mp4': true
    },  
    //cftp:{//后端ftp服务设置，用户上传的文件会上传到ftp服务
    //    host: "192.168.0.70",
    //    port: 21,
    //    user: "devftp",
    //    password: "qcdevftp",
    //    keepalive: 10000,
    //    path: ""
    //},
    coss:{
        object: "test",
        bucket: "baizu-res",
        craa: {
            region:"oss-cn-shanghai",
            accessKeyId:"LTAIZ8cgd0CsaFXE",
            accessKeySecret:"lujTzzVrzeVudFs2nIprAdwfpxWjsI"
        }
    },
    cach:[ //session弃用redis集群设置
        {
            port: 6379,
            host: '127.0.0.1'
        },
    ],
    ccps:{
        enabled: false,
        cluster: false,
        namespace:"sdcmnp",
        link:"sdcmlk",
        chat:"dscm",
        sync:{
            addr:"",
            port:5524,
            iurl:""
        },
        auth:{
            auth:"auth",
            addr:"",
            port:"",
            iurl:""
        }
    },    
    sess:{//session相关的参数设置，建议整站用一个顶级域名，方便session管理
        domain: [
            ["*.zudeapp.com", ".zudeapp.com"],
            ["*.zudeapp.com:*", ".zudeapp.com:*"]
        ],        
        key: 'sdcm keyboard',
        name: 'sdcm.sid',
        cluster: false,//redis是否要集群
        time: 600000 //10分钟
    },
    cacl:{
        //"webpc":{
        //    allow:["*.cnaidai.com"],
        //    deny:[""]
        //},
        //"webchat":{
        //    allow:["wechat.cnaidai.com"]
        //}
    },    
    code: {//验证码采用后端服务生成可以是dscm服务或者http服务
        path: '/verifyService?actn=code',
        hostname: '192.168.0.72',
        port: '5524',
        type: 'dscm'  
    }, 
    fdir:'/workspace/tq/zhejiang-province/nodejs/fle', //前端上传文件保存的临时目录
    dcfg:'/workspace/tq/zhejiang-province/dist'//前端请求资源文件本地存放路径
};

module.exports = config;