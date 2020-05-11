/**
 * @email   289784710@qq.com
 * @author  zhangshujuan
 * @date    2020-05-8
 *
 */
var ejs = require('./sdcm.eejs.js');  
var iset = require('./sdcm.iset.js');
var conf = require('./sdcm.conf.js');
var logj = require('./sdcm.logj.js');
var fs = require("fs");
var path = require("path");

exports = module.exports = function html(req, res, next) {
    if(!iset.set(req, res)) {
        res.jsonp({"code": -500000,
            "message": 'enverr',
            "success": false
        });          
        logj.reqerr("set-html-err", req, 'evnerr');
        return;
    }

    var html = null;
    try {
        if(conf.debug){
            html = ejs.render(null, {user:req.user,rslt:req.rslt},
                {cache:false,filename: req.conf.dtpl});
        }else{
            html = ejs.render(null, {user:req.user,rslt:req.rslt},
                {cache:true,filename: req.conf.dtpl});
        }
        res.writeHead(200, {
          'Content-Length': new Buffer(html+"",'utf-8').length,
          'Content-Type': 'text/html;encode=UTF-8'
        });
        res.end(html);
    }catch(exc) {
        if(conf.debug){
            html = "name: " + exc.name + "message: " + exc.message +
                "lineNumber: " + exc.lineNumber + "fileName: " + exc.fileName +
                "stack: " + exc.stack;
            res.end(html);
        } else {
            res.status(404);
            var folder = (req.baseUrl+"").split("/")[1];
            var test = path.resolve(conf.dcfg, folder, "404.html")+"";
            fs.access(test, fs.F_OK, function (err) {
                if (!err) {
                    res.sendFile(test);
                    return;
                }
                test = path.resolve(conf.dcfg, folder, "404.htm")+"";
                fs.access(test, fs.F_OK, function (err) {
                    if (!err) {
                        html = ejs.render(null, {user:req.user,rslt:req.rslt},{cache:true,filename: test})+"";
                        res.end(html);
                    } else if (conf.notFound) {
                        res.sendFile(conf.notFound);
                    } else {
                        res.status(404).send("请求的资源不存在");
                    }
                });
            });
        }

        logj.reqerr("call-html-err1", req, exc);
    }
};

