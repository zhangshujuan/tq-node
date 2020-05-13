/**
 * 公用方法
 */
var eejs = require('./sdcm.eejs.js'); 
var conf = require('./sdcm.conf.js');
var logj = require('./sdcm.logj.js');

exports.getParameter = function getParameter(req,name) {
    var value = req.query[name];
    if(value == null){
        value = req.body[name];
    }
    return value;
}

exports.getClientIp = function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

exports.getContextName = function getContextName(ctx) {
    if(!ctx || ctx.length <= 0) {
        return '';
    }

    var pos = 0, cur = 0;
    for (var i=0;i<ctx.length;i++){
        var c = ctx.charAt(i);
        if(c == '.') {
            pos = cur;
        } 

        cur++;
    } 

    return ctx.substr(0,pos);
}


exports.loadConf = function loadConf(req) {
    var result = null; 
    var module = req._$sdcm$_.conf.dcfg;
    try {
        if(conf.debug){
            delete require.cache[require.resolve(module)];
        }
        //result = require(module).itfconf();
        var objc = require(module);      
        req._$sdcm$_.objc = new objc();  
        result = req._$sdcm$_.objc.conf();
    } catch (exc) {
        logj.strerr("call-loadConf-err", module, exc);                
        result=null;
    } 
    return result;
}

function renderHtml(rslt, req, res, fld, fle) {
    var name = req._$sdcm$_.conf.dtpl, html = null, code = 200;
    try {
        if(conf.debug){
            html = eejs.render(null, {user:req.user,rslt:req.rslt},{cache:false,filename: req._$sdcm$_.conf.dtpl}); 
        }else{
            html = eejs.render(null, {user:req.user,rslt:req.rslt},{cache:true,filename: req._$sdcm$_.conf.dtpl}); 
        }
    }catch(exc) { 
        logj.strerr("call-renderHtml-err", name, exc);  
        html = "name: " + exc.name + 
            "message: " + exc.message + 
            "lineNumber: " + exc.lineNumber + 
            "fileName: " + exc.fileName + 
            "stack: " + exc.stack;
        if(conf.debug) {
            html = html + 'rslt:'+JSON.stringify(rslt,null,4);
        }    

        code = 500;
    }
    res.writeHead(code, {
      'Content-Length': new Buffer(html,'utf-8').length,
      'Content-Type': 'text/html;encode=UTF-8'
    });
    res.end(html); 
}

exports.loadLast = function loadLast(cfg, req, res, fld, fle) {
    var rslt = null;
    try {
        rslt = req._$sdcm$_.objc.out(req, res, fld, fle);
    } catch (exc) {
        logj.reqerr("call-loadLast-err", req, exc);        
        rslt = exc;
    }

    if(rslt) {
        if(req._$sdcm$_.conf.type == 'json') {
            res.jsonp(rslt);
        }else if(req._$sdcm$_.conf.type == 'html'){
            renderHtml(rslt, req, res, fld, fle);
        }else {
            res.writeHead(200, {
                'Content-Length': new Buffer(rslt,'utf-8').length,
                'Content-Type': 'text/html;encode=UTF-8'
              });
              res.end(rslt); 
        }
    }
    logj.reqinf('time compute', req, null);
}