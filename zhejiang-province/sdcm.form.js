/**
 * @email   289784710@qq.com
 * @author  zhangshujuan
 * @date    2020-05-8
 *
 */
var path = require('path');
var async = require('async');
var events = require('events');

var last = require('./sdcm.util.js').loadLast;
var load = require('./sdcm.util.js').loadConf;
var logj = require('./sdcm.logj.js');
var sock = require('./sdcm.sock.js');
var iset = require('./sdcm.iset.js');
var conf = require('./sdcm.conf.js'); 

exports = module.exports = function form(req, res, next) {
    if(!iset.set(req, res)) { 
        if(req.method.toUpperCase() == 'OPTIONS') {        
            return;
        }

        res.jsonp({
            "code": -500000,
            "memo": 'enverr',
            "succ": false
        });  

        logj.reqerr("call-form-err0", req, 'enverr');          
        return; 
    }

    var cfg = sock.loader(req, res, null, null);
    if(!cfg) {              
        return;
    }

    for(var i=0; i<cfg.itfs.length; i++){
        req._$sdcm$_.uuid.max = req._$sdcm$_.uuid.max + 1; 
        
        var bret = sock.request(cfg, cfg.itfs[i], 
            req, res, null,null, null);

//console.log("@@@@@@@@@@@@@@"+bret);
        if(!bret) {
            break;
        }
    }
};

