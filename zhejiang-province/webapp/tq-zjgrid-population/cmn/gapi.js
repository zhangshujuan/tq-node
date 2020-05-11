var ghost = require(process.argv[2]+'/tq-zjgrid-population/cfg/ghost.js'); 

class Objc {
	rslt(req, uuid) {
		console.log("zsj====>",req._$sdcm$_)
		return req._$sdcm$_.rslt[uuid];
	}

	md5(content) {
	    var crypto = require('crypto');
	    var md5 = crypto.createHash('md5');
	    md5.update(content);
	    return md5.digest('hex');
	}

	hidePhoneNumber(phoneNumber) {
	    if(phoneNumber.length<8) {
	        return "";
	    }
	    var rslt = phoneNumber.substring(0,3)+"****"+phoneNumber.substring(phoneNumber.length-4)
	    return rslt;
	}

	emptyEqual(tval, dval) {
		if(tval == null || (dval != null && tval == dval)) {
			return true;
		}
		
		return false;
	}

	emptyNoequal(tval, dval) {
		if(tval == null || (dval != null && tval != dval)) {
			return true;
		}
		
		return false;
	}

	isValidNumber(tval, min, max) {
	    if(isNaN(tval)) {
	        return false;
	    }
	    var rslt = true;
	    if(min != null) {
	        rslt &= tval>=min;
	    }
	    if (max != null) {
	        rslt &= tval<=max;
	    }
	    return rslt;
	}

	isPhoneNumber(val) {
	    if(/^1\d{10}$/.test(val)) {
	        return true;
	    }
	    return false;
	}

	hideBankNumber(bankNumber) {
	    if(bankNumber.length<8) {
	        return "";
	    }
	    var rslt = bankNumber.substring(0,4)+"****"+bankNumber.substring(bankNumber.length-4)
	    return rslt;
	}

	getParameter(req,name) {
	    var value = req.query[name];
	    if(value == null){
	        value = req.body[name];
	    }
		console.log("value===>",value)
	    return value;
	}

	getIPv4(ip) {
	    var match =  /\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/.exec(ip);
	    return match?match[0]:"";
	}	
	
	fileExt(fileName) {
		var p1 = fileName.lastIndexOf(".");
		var p2 = fileName.length;
		return fileName.substring(p1+1,p2);//后缀名
	}
}

class Auth extends Objc {
    constructor() {
        super();

        //为了保证在func中使用this
        this.fun = this.fun.bind(this);
	}
		
    //需要鉴权的话子类不可以在覆盖重写本方法
    fun(req,res,fld,fle) {
        // if(req.session.user == null) {
        //     return {stop:true};  
        // }

        //需要根据用户id去缓存中查询用户对当前接口是否有权限
        //没有的话返回403
        return this._fun(req,res,fld,fle);
    }

    //需要鉴权的话子类不可以在覆盖重写本方法
    out(req,res,fld,fle) {
        // if(!req.session.user || !req.session.user.bzUid) {
        //     return {err_code:401, err_msg:"未登录"};
        // }

        //需要根据用户id去缓存中查询用户对当前接口是否有权限
		//没有的话返回403     

        return this._out(req,res,fld,fle);
    }    

    _fun(req,res,fld,fle) {

    }

    _out(req,res,fld,fle) {
        
	}  
	
	getBzid(req, res, fld, fle) {
		return (req.session.user != null ? req.session.user.bzUid : null);
	}
}

var Category = {
	"3":{"cat_id":"ZMSC_1_1_6","name":"出境WIFI"},
	"4":{"cat_id":"ZMSC_1_1_6","name":"水下相机"},
	"5":{"cat_id":"ZMSC_1_1_6","name":"导航仪"},
	"11":{"cat_id":"ZMSC_1_5_1","name":"旅行箱"},
	"12":{"cat_id":"ZMSC_1_5_1","name":"转换插头"},
	"13":{"cat_id":"ZMSC_1_5_1","name":"其他"},
	"14":{"cat_id":"ZMSC_1_5_1","name":"运动/瑜伽/球迷用品"},
	"15":{"cat_id":"ZMSC_1_5_1","name":"帐蓬"},
	"16":{"cat_id":"ZMSC_1_5_1","name":"睡袋"},
	"17":{"cat_id":"ZMSC_1_5_1","name":"户外照明"},
	"18":{"cat_id":"ZMSC_1_5_1","name":"军迷用品"},
	"19":{"cat_id":"ZMSC_1_5_1","name":"防潮垫"},
	"20":{"cat_id":"ZMSC_1_5_1","name":"炉具烧烤"},
	"21":{"cat_id":"ZMSC_1_5_1","name":"登山杖"},
	"22":{"cat_id":"ZMSC_1_5_1","name":"望远镜"},
	"23":{"cat_id":"ZMSC_1_5_1","name":"对讲机"},
	"24":{"cat_id":"ZMSC_1_5_1","name":"钓竿"},
	"25":{"cat_id":"ZMSC_1_5_1","name":"渔具套装"},
	"26":{"cat_id":"ZMSC_1_5_1","name":"渔线"},
	"27":{"cat_id":"ZMSC_1_5_1","name":"其他"},
	"28":{"cat_id":"ZMSC_1_5_1","name":"运动包"},
	"29":{"cat_id":"ZMSC_1_5_1","name":"户外包"},
	"30":{"cat_id":"ZMSC_1_5_1","name":"户外配件"},
	"31":{"cat_id":"ZMSC_1_5_1","name":"其他"},
	"32":{"cat_id":"ZMSC_1_5_1","name":"自行车"},
	"33":{"cat_id":"ZMSC_1_5_1","name":"骑行装备"},
	"34":{"cat_id":"ZMSC_1_5_1","name":"其他"},
	"40":{"cat_id":"ZMSC_1_4_1","name":"演艺帽子/配件"},
	"41":{"cat_id":"ZMSC_1_4_1","name":"演艺道具"},
	"42":{"cat_id":"ZMSC_1_4_1","name":"婚纱"},
	"43":{"cat_id":"ZMSC_1_4_1","name":"礼服"},
	"44":{"cat_id":"ZMSC_1_4_1","name":"其他"},
	"45":{"cat_id":"ZMSC_1_4_1","name":"节庆用品/演艺用品"},
	"46":{"cat_id":"ZMSC_1_4_1","name":"演艺服饰"},
	"52":{"cat_id":"ZMSC_1_1_5","name":"飞行器/无人机"},
	"53":{"cat_id":"ZMSC_1_1_5","name":"AR/VR设备"},
	"54":{"cat_id":"ZMSC_1_1_5","name":"游戏机"},
	"55":{"cat_id":"ZMSC_1_1_3","name":"运动相机"},
	"60":{"cat_id":"ZMSC_1_4_1","name":"服饰配件/皮带/帽子/围巾"},
	"61":{"cat_id":"ZMSC_1_4_1","name":"女装"},
	"62":{"cat_id":"ZMSC_1_4_1","name":"男装"},
	"67":{"cat_id":"ZMSC_1_4_3","name":"箱包"},
	"68":{"cat_id":"ZMSC_1_4_3","name":"女包"},
	"69":{"cat_id":"ZMSC_1_4_3","name":"男包"},
	"70":{"cat_id":"ZMSC_1_4_3","name":"皮具"},
	"71":{"cat_id":"ZMSC_1_4_2","name":"手表"},
	"72":{"cat_id":"ZMSC_1_4_2","name":"饰品/流行首饰/时尚饰品新"},
	"81":{"cat_id":"ZMSC_1_4_2","name":"家居饰品"},
	"82":{"cat_id":"ZMSC_1_8_4","name":"五金/工具"},
	"83":{"cat_id":"ZMSC_1_8_4","name":"电子/电工"},
	"84":{"cat_id":"ZMSC_1_7_3","name":"特色手工艺"},
	"85":{"cat_id":"ZMSC_1_9_2","name":"商业/办公家具"},
	"86":{"cat_id":"ZMSC_1_8_4","name":"住宅家具"},
	"87":{"cat_id":"ZMSC_1_26_1","name":"花卉仿真"},
	"88":{"cat_id":"ZMSC_1_26_1","name":"绿植园艺"},
	"92":{"cat_id":"ZMSC_1_3_2","name":"书籍"},
	"93":{"cat_id":"ZMSC_1_3_2","name":"杂志"},
	"94":{"cat_id":"ZMSC_1_3_2","name":"报纸"},
	"95":{"cat_id":"ZMSC_1_18_4","name":"音像"},
	"98":{"cat_id":"ZMSC_1_5_3","name":"钢琴"},
	"99":{"cat_id":"ZMSC_1_5_3","name":"数码钢琴"},
	"100":{"cat_id":"ZMSC_1_5_3","name":"电子琴"},
	"101":{"cat_id":"ZMSC_1_5_3","name":"吉他"},
	"102":{"cat_id":"ZMSC_1_5_3","name":"小提琴"},
	"103":{"cat_id":"ZMSC_1_5_3","name":"大提琴"},
	"104":{"cat_id":"ZMSC_1_5_3","name":"电贝斯"},
	"105":{"cat_id":"ZMSC_1_5_3","name":"萨克斯"},
	"106":{"cat_id":"ZMSC_1_5_3","name":"民族乐器"},
	"107":{"cat_id":"ZMSC_1_5_3","name":"乐器配件"},
	"108":{"cat_id":"ZMSC_1_5_3","name":"其他"},
	"115":{"cat_id":"ZMSC_1_4_1","name":"童装/婴儿装/亲子装"},
	"116":{"cat_id":"ZMSC_1_6_1","name":"孕妇装/孕产妇用品/营养"},
	"117":{"cat_id":"ZMSC_1_6_4","name":"玩具/童车/益智/积木/模型"},
	"118":{"cat_id":"ZMSC_1_6_4","name":"模玩/动漫/周边/cos/桌游"},
	"119":{"cat_id":"ZMSC_1_6_1","name":"婴儿床"},
	"120":{"cat_id":"ZMSC_1_6_1","name":"推车"},
	"121":{"cat_id":"ZMSC_1_6_1","name":"安全座椅"},
	"125":{"cat_id":"ZMSC_1_15_1","name":"汽车"},
	"126":{"cat_id":"ZMSC_1_15_1","name":"汽车配件/装备"},
	"127":{"cat_id":"ZMSC_1_15_1","name":"摩托车"},
	"128":{"cat_id":"ZMSC_1_15_1","name":"摩托配件/骑士装备"},
	"133":{"cat_id":"ZMSC_1_5_2","name":"跑步机"},
	"134":{"cat_id":"ZMSC_1_5_2","name":"按摩椅"},
	"135":{"cat_id":"ZMSC_1_5_2","name":"踏步机"},
	"136":{"cat_id":"ZMSC_1_5_2","name":"其他"},
	"137":{"cat_id":"ZMSC_1_5_2","name":"台球桌"},
	"138":{"cat_id":"ZMSC_1_5_2","name":"乒乓球桌"},
	"139":{"cat_id":"ZMSC_1_5_2","name":"其他"},
	"140":{"cat_id":"ZMSC_1_20_1","name":"助听器"},
	"141":{"cat_id":"ZMSC_1_20_1","name":"轮椅"},
	"142":{"cat_id":"ZMSC_1_20_1","name":"康复器材"},
	"143":{"cat_id":"ZMSC_1_20_1","name":"其他"},
	"158":{"cat_id":"ZMSC_1_29_1","name":"网络设备/网络相关"},
	"159":{"cat_id":"ZMSC_1_1_2","name":"台式机"},
	"160":{"cat_id":"ZMSC_1_1_2","name":"一体机"},
	"161":{"cat_id":"ZMSC_1_1_2","name":"服务器"},
	"162":{"cat_id":"ZMSC_1_1_3","name":"数码相机"},
	"163":{"cat_id":"ZMSC_1_1_3","name":"单反相机"},
	"164":{"cat_id":"ZMSC_1_1_3","name":"摄像机"},
	"165":{"cat_id":"ZMSC_1_1_2","name":"MP3/MP4/iPod/录音笔"},
	"166":{"cat_id":"ZMSC_1_1_2","name":"电脑硬件/显示器/电脑周边"},
	"167":{"cat_id":"ZMSC_1_1_2","name":"笔记本电脑"},
	"168":{"cat_id":"ZMSC_1_1_4","name":"3C数码配件"},
	"169":{"cat_id":"ZMSC_1_21_1","name":"闪存卡/U盘/存储/移动硬盘"},
	"170":{"cat_id":"ZMSC_1_21_1","name":"电玩/配件/游戏/攻略"},
	"171":{"cat_id":"ZMSC_1_1_2","name":"平板电脑/MID"},
	"172":{"cat_id":"ZMSC_1_1_5","name":"智能数码设备"},
	"173":{"cat_id":"ZMSC_1_9_1","name":"办公设备"},
	"174":{"cat_id":"ZMSC_1_1_6","name":"电子词典/电纸书/文化用品"},
	"178":{"cat_id":"ZMSC_1_1_1","name":"智能手机"},
	"179":{"cat_id":"ZMSC_1_1_1","name":"功能机"},
	"180":{"cat_id":"ZMSC_1_1_1","name":"老人机"},
	"181":{"cat_id":"ZMSC_1_1_1","name":"手机配件"},
	"183":{"cat_id":"ZMSC_1_1_1","name":"充电宝"},
	"190":{"cat_id":"ZMSC_1_18_4","name":"电视机"},
	"191":{"cat_id":"ZMSC_1_18_4","name":"家庭影院"},
	"192":{"cat_id":"ZMSC_1_18_4","name":"音响"},
	"193":{"cat_id":"ZMSC_1_18_4","name":"其他"},
	"194":{"cat_id":"ZMSC_1_18_1","name":"油烟机"},
	"195":{"cat_id":"ZMSC_1_18_1","name":"洗碗机"},
	"196":{"cat_id":"ZMSC_1_18_1","name":"热水器"},
	"197":{"cat_id":"ZMSC_1_18_1","name":"消毒柜"},
	"199":{"cat_id":"ZMSC_1_18_1","name":"净水器"},
	"200":{"cat_id":"ZMSC_1_18_1","name":"其他"},
	"201":{"cat_id":"ZMSC_1_18_3","name":"空气净化器"},
	"202":{"cat_id":"ZMSC_1_18_3","name":"扫地机器人"},
	"203":{"cat_id":"ZMSC_1_18_3","name":"取暖器"},
	"204":{"cat_id":"ZMSC_1_18_3","name":"加湿器"},
	"205":{"cat_id":"ZMSC_1_18_3","name":"其他"},
	"206":{"cat_id":"ZMSC_1_18_2","name":"洗衣机"},
	"207":{"cat_id":"ZMSC_1_18_2","name":"冰箱"},
	"208":{"cat_id":"ZMSC_1_18_2","name":"冷柜"},
	"209":{"cat_id":"ZMSC_1_18_2","name":"空调"},
	"210":{"cat_id":"ZMSC_1_18_2","name":"其他"},
	"211":{"cat_id":"ZMSC_1_5_2","name":"个人护理/保健/按摩器材"},
	"212":{"cat_id":"ZMSC_1_1_5","name":"其他"},
	"213":{"cat_id":"ZMSC_1_5_3","name":"鼓"},
	"218":{"cat_id":"ZMSC_1_1_3","name":"镜头"}	
}

//必须放在文件的最后面
exports = module.exports = { Auth, Objc, Category } ;