var ftp = require('ftp'); 
var path = require('path');
var async = require('async');
var multiparty = require('multiparty');// Multiparty是用来解析FormData数据的一款插件 https://www.npmjs.com/package/multiparty

var load = require('./sdcm.util.js').loadConf; 
var last = require('./sdcm.util.js').loadLast;
var logj = require('./sdcm.logj.js');
var conf = require('./sdcm.conf.js'); 
var sock = require('./sdcm.sock.js');
var iset = require('./sdcm.iset.js');

exports = module.exports = function file (req, res, next) {
    if(!iset.set(req, res)) { 
        if(req.method.toUpperCase() == 'OPTIONS') {           
            return;
        }        
        res.jsonp({"code": -500000,
            "message": 'enverr',
            "success": false
        });  

        logj.reqerr("call-file-err0", req, 'enverr');          
        return; 
    }

    var form = new multiparty.Form({uploadDir: conf.fdir+'/', maxFilesSize:conf.umfs});
    form.parse(req, function(err, fld, fle){
        if(err){
            req._$sdcm$_.uuid.err = true; req._$sdcm$_.uuid.msg = err;    
            res.jsonp({"code": -300000, "success": false,
                "message": 'file size exceeded ' + conf.umfs
            }); 

            logj.reqerr("call-file-err1", req, err);            
            return;
        }

        var cfg = sock.loader(req, res, fld, fle);
        if(!cfg) {
            return;
        }

        for(var i=0; i<cfg.itfs.length; i++){
            req._$sdcm$_.uuid.max = req._$sdcm$_.uuid.max + 1; 
            
            var bret = sock.request(cfg, cfg.itfs[i], 
                req, res, fld, fle, null);

   // console.log("@@@@@@@@@@@@@@"+bret);
            if(!bret) {
                break;
            }
        }                                           
    });
};

