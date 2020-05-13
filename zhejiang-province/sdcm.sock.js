/**
 * 请求处理
 */
var co = require('co');
var fs = require('fs'); 
var ftp = require('ftp');
var util = require('util');
var http = require('http');
var hssl = require('https');
var async = require('async');
var qs = require("querystring");
var aliOss = require('ali-oss');

var conf = require('./sdcm.conf.js');
var logj = require('./sdcm.logj.js');
var load = require('./sdcm.util.js').loadConf;
var last = require('./sdcm.util.js').loadLast;

var sock = exports = module.exports = {};

sock.next = function(cfg, itf, req, res, fld, fle,fuc) {
    for(var i=0; i<itf.length; i++){
        req._$sdcm$_.uuid.max = req._$sdcm$_.uuid.max + 1; 

        var bret = sock.request(cfg, itf[i], 
            req, res, null,null, null);

        if(!bret) {
            break;
        }
    }
}

sock.prepare = function (citf, param, user) {
     var options = {hostname: citf.host, port: citf.port, path: citf.iurl, method: citf.meth,headers:null};
     options.headers={'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8','user':user};
     console.log("sock====>",citf)
     if(citf.type == 'sdcm') {
        options.headers={'claz':param.claz};
     } else {
        if(citf.rfmt != null && citf.rfmt.toUpperCase() == 'JSON') {
            options.headers={'Content-Type': 'application/json; charset=UTF-8','user':user};
        }

        if(citf.meth.toUpperCase() == 'GET'){
            //if(citf.rfmt != null && citf.rfmt.toUpperCase() == 'JSON') {
            //    options.path = citf.iurl+"?"+JSON.stringify(param.objv);  
            //}else{
                //console.log("::sss::"+qs.stringify(param.objv));
                options.path = citf.iurl+"?"+qs.stringify(param.objv);  
            //} 
        }
     }

     options.agent = false;
     return options;    
}

sock.isBrace = function (obj) {
    var bRet = true;
    for(var o in obj) {
        bRet = false;
        break;
    }

    return bRet;
}

function calfuc(req, res, msg) {
    req._$sdcm$_.uuid.msg = msg;

 //console.log("$$$$$"+req.uuid.cur+"::"+req.uuid.max);

    if(req._$sdcm$_.uuid.cur >= req._$sdcm$_.uuid.max){
        last(null, req, res, null,null);
        req._$sdcm$_.objc = null;
        req._$sdcm$_.rslt = null;
        req._$sdcm$_ = null;
    }  
}

function allow(filename) {
    if(filename == null){
        return false;
    }

    var pos = filename.lastIndexOf('.');
    if(pos < 0){
        return false;
    }

    try{
        return conf.fext[filename.substr(pos+1)];
    }catch(err){

    }

    return false;
}

function remove(path) {
    fs.exists(path, function (exists) {
        if(exists){
            fs.unlink(path);
        }
    });   
}

sock.chck = function(fle, res) {
    var array = []; if(fle == null) {
        return array;
    }

    for(var the in fle){  
        for(var obj in fle[the]){
            if(!allow(fle[the][0].originalFilename)) {
                res.jsonp({"code": -300000,
                    "memo": 'fileerr',
                    "succ": false
                }); 
    
                remove(fle[the][obj].path);
    
                logj.strerr("call-ftp-err1", fle[the][obj].path, null); 
                return null;
            }  

            array.push(fle[the][obj]);
        }
    } 

    return array;
}

sock.file = function(array) {
    array.forEach(function(the){
        if(conf.cftp != null) {
            var ftpClient = new ftp();  
            ftpClient.on('ready', function() {
                ftpClient.put(the.path, conf.cftp.path+the.originalFilename, function(err) {
                    if (err) {
                        logj.strerr("call-ftp-err2", the.path, err);                      
                    }

                    ftpClient.end();
                    ftpClient.destroy();

                    remove(the.path);                             
                });
            });         
            ftpClient.connect(conf.cftp); 
        } else if(conf.coss != null) {
            var client = new aliOss(conf.coss.craa);
            co(function* () {
                client.useBucket(conf.coss.bucket);
                var rslt = yield client.put(conf.coss.object + "/" + the.originalFilename, the.path);
                logj.logger().info("call-oss-info path=[%s] rslt=[%s]", the.path, JSON.stringify(rslt));    
            }).catch(function (err) {
                logj.strerr("call-oss-err2", the.path, err);  
            });          
        }             
    });

    return true;
}

sock.object = function(itf, opt, fuc) {
    if(itf.type == 'hssl') {
        return hssl.request(opt, fuc);
    }

    return http.request(opt, fuc);
}

sock.cfunc = function (itf, req, res, fld, fle) {
    try{
        return itf.func (req, res, fld, fle); 
    }catch(err) {
        return {cerr: true};
    }
}

sock.request = function(cfg, itf, req, res, fld, fle) {
    req._$sdcm$_.rslt[itf.uuid] = {succ:false, objv:null};

    //console.log(itf.uuid+":-------------:"+req._$sdcm$_.uuid.cur+"::"+req._$sdcm$_.uuid.max);

    var array = sock.chck(fle, res);
    if(array == null) {
        req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;
        calfuc(req, res, itf.uuid + ': ftp err');   
        return false;
    }
    
    //console.log(itf.uuid+":------ee-------:"+req._$sdcm$_.uuid.cur+"::"+req._$sdcm$_.uuid.max);
    var param = sock.cfunc(itf, req, res, fld, fle);
    if(param.cerr) {
        req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;

        calfuc(req, res, itf.uuid + ': func cerr');

        array = null;
        return false;
    } 
    
    sock.file(array);
    array = null;

    //console.log(itf.uuid+":------ee44-------:"+req._$sdcm$_.uuid.cur+"::"+req._$sdcm$_.uuid.max);
    if(param.stop) {
        req._$sdcm$_.rslt[itf.uuid].succ = true;
        req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1; 

        calfuc(req, res, itf.uuid + ': func stop');
        return false;
    }

    //console.log(itf.uuid+":------ee55-------:"+req._$sdcm$_.uuid.cur+"::"+req._$sdcm$_.uuid.max);
    if(param.jump) {
        //req.rslt[itf.uuid].objv = null;
        req._$sdcm$_.rslt[itf.uuid].succ = true;

        req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;        
        
        //calfuc(req, res, itf.uuid + ': func jump');
        if(itf.next != null && itf.next.length > 0) {
            sock.next(cfg, itf.next, req, res, fld, fle, null);
        }
        return true;
    }

    //console.log(itf.uuid+"=============>>"+req._$sdcm$_.uuid.cur+"::"+req._$sdcm$_.uuid.max);
    if(param.iurl) {
        itf.iurl = param.iurl;
    }

    var body = '',sody = null;
    var option = sock.prepare (itf, param, req._$sdcm$_.user);
    //var object = http.request(option, function(output){
    var object = sock.object(itf, option, function(output){    
         output.setEncoding('utf8');
         output.on('data',function(d){
             body += d;
         }).on('end', function() {//console.log("::sss::"+body);
            if(!output.headers['errs']) {
                req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;

                if(itf.cfmt != null && itf.cfmt != "json") {
                    sody = body;
                }else{
                    try{
                        sody = JSON.parse(body);//  eval('(' + body + ')');
                    }catch(err){              
                        req._$sdcm$_.rslt[itf.uuid].objv = err;  
                        calfuc(req, res, itf.uuid + ": " + body);  
                        logj.strerr("call-err", option.path, body);            
                        return;
                    }
                }

                req._$sdcm$_.rslt[itf.uuid].objv = sody;
                req._$sdcm$_.rslt[itf.uuid].succ = true;

                if(itf.next && itf.next.length > 0){
                    sock.next(cfg, itf.next, req, res, fld, fle, null);
                }else{
                    calfuc(req, res, itf.uuid); 
                }
            }else{ 
                req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;

                //console.log(itf.uuid+">>>>>AAA>>>>>>"+body);
                logj.strerr("call-err", option.path, body); 
                req._$sdcm$_.rslt[itf.uuid].objv = output.headers['errs']; 
	            calfuc(req, res, itf.uuid + ": " + output.headers);             
            }
         }); 
     });    

     object.on ('error', function(err) {  
        req._$sdcm$_.rslt[itf.uuid].objv = err;  
        req._$sdcm$_.uuid.cur = req._$sdcm$_.uuid.cur + 1;   //console.log(itf.uuid+">>>>>>>ssssssssssss>>>>"+JSON.stringify(err));
        calfuc(req, res, itf.uuid + ': server err');   
        logj.strerr("call-err", option.path, "server err="+(!err ? '' : err.toString()));      
     });

     object.setNoDelay(true);
     object.setSocketKeepAlive(false);
     object.setTimeout(conf.timeout, function(){
     	object.abort();
     });

     if(itf.meth.toUpperCase() == 'POST' || itf.type == 'sdcm'){
        if(itf.type == 'sdcm') {
            object.write(JSON.stringify(!param.objv ? null : param.objv));
        }else{
            if(itf.rfmt != null && itf.rfmt.toUpperCase() == 'JSON') {
                object.write(JSON.stringify(param.objv));
            }else{
                object.write(qs.stringify(param.objv));
            }
        }
     }   
     object.end();

     return true;
}

sock.ccps = function(citf, param, calfuc) {
    var options = {hostname: citf.host, port: citf.port, path: citf.iurl, method: citf.meth,headers:null};
    options.headers={'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8','user':user};
    console.log("citf====>",citf)
    if(citf.meth.toUpperCase() == 'GET' && citf.type != 'sdcm'){
        options.path = citf.iurl+"?"+qs.stringify(param);    
    }else if(citf.type == 'sdcm') {
        options.headers={'claz':param.claz};
    }

    options.agent = false;
    var object = http.request(option, function(output){
         output.setEncoding('utf8');
         output.on('data',function(d){
             body += d;
         }).on('end', function() {
            if(!output.headers['errs']) {
                try{
                    sody = JSON.parse(body);//  eval('(' + body + ')');
                    calfuc(false, sody); 
                }catch(err){
                    calfuc(true, body); 
                }
            }else{
                logj.strerr("call-dscm-err", option.path, body);   
                calfuc(true, body);           
            }
         }); 
     });    

     object.on ('error', function(err) {
        calfuc(true, err);   
     });

     object.setNoDelay(true);
     object.setSocketKeepAlive(false);
     object.setTimeout(conf.timeout, function(){
        object.abort();
     });

     if(itf.meth.toUpperCase() == 'POST' || citf.type == 'sdcm'){
        if(itf.type == 'sdcm') {
            object.write(JSON.stringify(!param.json ? null : param.json));
        }else{//console.log("======send====="+qs.stringify(param));
            object.write(qs.stringify(param));
        }
     }   
     object.end();
}

sock.code = function(req, res, tex) {
    var body = '', option = {
        hostname: conf.code.hostname,
        path: conf.code.path,
        port: conf.code.port,
        method: 'post',
        agent: false
    }; 

    option.headers = {'claz':'["java.lang.String"]'};
    if(conf.code.type != 'dscm') {
        option.method = 'get';
        option.headers = null;
        option.path = option.path + '?code='+tex;
    }
    
    var object = http.request(option, function(output){
        output.setEncoding(conf.code.type == 'dscm' ? 'UTF-8' : 'binary');
        output.on('data',function(d){
            body += d;
        }).on('end', function() {
            if(!output.headers['errs']) {
                var encode = conf.code.type == 'dscm' ? 'base64' : 'binary'
                , buffer = new Buffer(body, encode);
                res.writeHead(200, {
                  'Content-Length': buffer.length,
                  'Content-Type': 'image/jpeg'
                });
                res.write(buffer); 
                delete buffer;
                buffer = null;              
            }else{
                logj.strerr("call-code-err", conf.code.path, body);          
            }
            res.end();
        }); 
    });    

    object.setNoDelay(true);
    object.setSocketKeepAlive(false);
    object.setTimeout(conf.timeout, function(){
        object.abort();
    });

    object.on ('error', function(err) {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end('sys-code-err');
    });     

    if(conf.code.type == 'dscm') {
        object.write(JSON.stringify([tex]));  
    }
    object.end();
}

sock.loader = function(req, res, fld, fle) {
    //var cfg = load(req._$sdcm$_.conf.dcfg);
    var cfg = load(req);
    if(!cfg) {
        res.jsonp({
            "code": -800000,
            "memo": 'cfgerr',
            "succ": false
        });  

        logj.reqerr("call-file-err4", req, 'cfgerr');  
 
        req._$sdcm$_.objc = null;
        req._$sdcm$_.rslt = null;
        req._$sdcm$_ = null;        
        return null;
    }

    if(!cfg.itfs || cfg.itfs.length <= 0) {
        last(cfg, req, res, fld,fle);

        req._$sdcm$_.objc = null;
        req._$sdcm$_.rslt = null;
        req._$sdcm$_ = null;
                
        return null;
    }  

    req._$sdcm$_.conf.type = cfg.type;

    return cfg;    
}