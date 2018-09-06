var mysql = require('mysql');
var Constant_config = require('../core/constant_config.js');
var Common = require('../core/common.js');
var common = new Common();

var con = mysql.createConnection(Constant_config);
con.connect(function (err) {
    if (err) throw err;
});

var User_tmp = function () {}

User_tmp.prototype.get_info = function (query, callback) {
    con.query(query, function (err, result, fields) {
        if (err){
            var res = {
                result : 'FAILED',
                data : err
            }
        }else{
            result = common.parseJsonData(result);
            var res = {
                result : 'OK',
                data: result
            }
        }
        callback (res);
    });
}

User_tmp.prototype.update_status_online = function (accoutID, setdata, callback) {
    var query = 'UPDATE account SET online_status = '+setdata+' _id = '+accoutID;

    con.query(query, function (err, result, fields) {
        if (err){
            var res = {
                result : 'FAILED',
                data : err
            }
        }else{
            result = common.parseJsonData(result);
            var res = {
                result : 'OK',
                data: result
            }
        }
        callback (res);
    });
}

User_tmp.prototype.get_info_syns = function (query,data_syns, callback) {
    con.query(query, function (err, result, fields) {
        if (err){
            var res = {
                result : 'FAILED',
                data : err,
                data_syns : data_syns
            }
        }else{
            result = common.parseJsonData(result);
            var res = {
                result : 'OK',
                data: result,
                data_syns : data_syns
            }
        }
        callback (res);
    });
}


module.exports = User_tmp;