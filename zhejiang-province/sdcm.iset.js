/**
 * @email   289784710@qq.com
 * @author  zhangshujuan
 * @date    2020-05-8
 *
 */
var getContextName = require('./sdcm.util.js').getContextName; 
var getClientIp = require('./sdcm.util.js').getClientIp;  
var conf = require('./sdcm.conf.js');
var path = require('path');
var url = require('url');

var iset = exports = module.exports = {};

iset.set = function(req, res) {
    req._$sdcm$_ = {
        user: {
            code: req.session.code,
            user: req.session.user,
            addr: getClientIp(req)
        },
        conf: {
            btpl: false
        },
        objc: {},
        rslt: {},
        uuid: {
            max: 0,
            cur: 0,
            msg: 'ok',
            tim: new Date(),
            app: ''
        }
    };

    var cctx = req.baseUrl.split('/');
    if(cctx.length <= 0) {
        res.jsonp({
            "code": -900000,
            "memo": 'ctxerr',
            "succ": false
        });
        return false;
    } 

    if(cctx.length > 2) { req._$sdcm$_.uuid.app = cctx[1]; }

    req._$sdcm$_.conf.name = getContextName(cctx[cctx.length-1]);
    
    cctx.splice(cctx.length-1, 1);

    req._$sdcm$_.conf.dcfg = path.join(process.argv[2], 
        cctx.join('/'), 
        req._$sdcm$_.conf.name + '.cfg'
    );

    req._$sdcm$_.conf.dtpl = path.join(process.argv[2], 
        cctx.join('/'), 
        req._$sdcm$_.conf.name + '.htm'
    ); 

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    return true;      
}