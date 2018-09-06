/**
 * author: Martin
 * common functions are served in controllers & models
 */
var Constant = require('./constant.js');

//begin class

function Common(){}

//=========
Common.prototype.xlog = function(mess, data){
    if (console.log){
        console.log(mess, data);
    }
};

Common.prototype.dlog = function(mess){
    if (console.log){
        console.log(mess);
    }
};

Common.prototype.parseJsonData = function (data) {
    var string=JSON.stringify(data);
    var json =  JSON.parse(string);
    return json;
}

Common.prototype.isNull = function(a_var){
    return a_var == null || a_var === undefined;
};

Common.prototype.trim = function(a_var){
    //will find a trim function
    // a_var = unescape(a_var);     //will affect function isEmpty
    return a_var;
};

Common.prototype.dlogJSON = function(mess){
    if (!common.isEmpty(mess))		//avoid IE
        console.log(JSON.stringify(mess));
};

Common.prototype.isEmpty = function(a_var){
    if(typeof a_var === undefined || a_var === undefined || a_var == null || common.trim(a_var) == '')
        return true;
    return false;
};

Common.prototype.isStrictEmpty = function(a_var){
    if(a_var == 'undefined' || a_var == 'null' || a_var === undefined || a_var == null || common.trim(a_var) == '')
        return true;
    return false;
};

Common.prototype.isNotEmpty = function(a_var){
    return !common.isEmpty(a_var);
};

Common.prototype.isArray = function(something){
    return Object.prototype.toString.call( something ) === '[object Array]';
};

Common.prototype.get_obj_len = function(obj){
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * check token of requests from client, prevent hacking
 * @param req
 * @param user_id
 */
Common.prototype.checkLLOGToken = function(req, res, next){
    // var token = req.headers[Constant.LLOG_ACCESS_TOKEN_KEY];
    // if (token == config.llog_token){
    //client sent valid request
    next();     //continue;
    // } else {
    //     res.rest.forbidden();       //invalid request, returns error to client
    // }
};
/**
 * save id of logined user
 * @param req
 * @param user_id
 */
Common.prototype.saveSessionLogin = function(req, user_id){
    req.session[Constant.SESSION.KEY_USER_ID] = user_id;
    req.session.save();
};
/**
 * remove session after logout
 * @param req
 */
Common.prototype.removeSessionLogin = function(req){
    req.session[Constant.SESSION.KEY_USER_ID] = '';
    req.session.save();
};
/**
 * check if user logined or not
 * @param req
 */
Common.prototype.isNotLogined = function(req){
    return false;
    //todo: open comment when finish functions
    // return !common.isNotEmpty(req.session[Constant.SESSION.KEY_USER_ID]);
};
/**
 * get id of logined user
 * @param req
 * @returns {*}
 */
Common.prototype.getLoginedUserId = function(req){
    return req.session[Constant.SESSION.KEY_USER_ID];
};
/**
 * check if a & b is XOR empty (one of both is empty)
 */
Common.prototype.isXorEmpty = function(a, b){
    return (common.isEmpty(a) && common.isNotEmpty(b)) || (common.isEmpty(b) && common.isNotEmpty(a));
};

Common.prototype.unescape = function(a){
    return unescape(a);
};

//prevent inline hacking
Common.prototype.escapeHtml = function(text){
//	var map = {
//		    '&': '&amp;',
//		    '"': '&quot;',
//		    "'": '&#039;',
//			'<': '&lt;',
//		    '>': '&gt;'
//		  };
//	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    return text;
};

/**
 * replace all Vietnamese characters by normal latin, used in searching
 */
Common.prototype.replaceVietnameseChar = function(a_str){
    var plainString = a_str.toLowerCase();
    plainString = plainString.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    plainString = plainString.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    plainString = plainString.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    plainString = plainString.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    plainString = plainString.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    plainString = plainString.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    plainString = plainString.replace(/đ/g, 'd');

    return plainString;
};

/*
 * get mutual phone number, convert between normal phone & +84
 */
Common.prototype.get_mutual_phone_num = function(phone){
    if (this.isEmpty(phone))
        return phone;
    if (phone.indexOf('+84') == 0) {		//phone num starts at first position
        return '0' + phone.substr(3, phone.length);
    } else {
        return '+84' + phone.substr(1, phone.length);
    }
};

//convert variable to boolean value
Common.prototype.parseBool = function(b) {
    return !(/^(false|0)$/i).test(b) && !!b;
};

Common.prototype.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};




/**
 * encoding base64
 */
Common.prototype.Base64_encode = function(data){
    // Create Base64 Object
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
    return Base64.encode(data);
};

/**
 * encoding base64
 */
Common.prototype.Base64_decode = function(data){
    // Create Base64 Object
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
    return Base64.decode(data);
};

Common.prototype.plain_name_escapt = function (string) {
    return this.replaceVietnameseChar(this.escapeHtml(string)).toLowerCase();
}

Common.prototype.stringGen = function(len)
{
    var text = " ";

    var charset = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
};

Common.prototype.getFormattedDate = function (date, option) {
    if (common.isNotEmpty(date)){
        myDate = new Date(date);
    }else{
        myDate = new Date();
    }

    var  date = (myDate.getDate()>= 10)?myDate.getDate():'0'+(myDate.getDate());
    var month = ((myDate.getMonth() + 1) >= 10)?myDate.getMonth() + 1: '0'+ (myDate.getMonth() + 1);
    var year = myDate.getFullYear();
    var hours = (myDate.getHours()>=10)?myDate.getHours():'0'+(myDate.getHours());
    var minutes = (myDate.getMinutes() >= 10)?myDate.getMinutes():'0'+ (myDate.getMinutes());
    var second = (myDate.getSeconds() >= 10)?myDate.getSeconds():'0'+(myDate.getSeconds());

    if(common.isEmpty(option)) {
        return date + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + second;
    }
    else{
        if(option == 'd/m/y'){
            return date + '/' + month + '/' + year;
        }
        else if(option == 'm/y'){
            return month + '/' + year;
        }
        else if(option == 'y'){
            return year;
        }
    }
};

Common.prototype.randomString = function (length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
};

/**
 * delete file
 */
Common.prototype.deleteFile = function(path) {
    if( fs.existsSync(path) ) {
        fs.unlinkSync(path);
    }
};
//
Common.prototype.cloneObject = function(original){
    // First create an empty object with
    // same prototype of our original source
    var clone = Object.create( Object.getPrototypeOf( original ) ) ;

    var i , keys = Object.getOwnPropertyNames( original ) ;

    for ( i = 0 ; i < keys.length ; i ++ )
    {
        // copy each property into the clone
        Object.defineProperty( clone , keys[ i ] ,
            Object.getOwnPropertyDescriptor( original , keys[ i ] )
        ) ;
    }

    return clone ;
};
//========== global variable
var common = new Common();

module.exports = Common;