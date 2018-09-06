var mysql = require('mysql');
var Constant_config = require('../core/constant_config.js');
var Common = require('../core/common.js');
var common = new Common();

var con = mysql.createConnection(Constant_config);
con.connect(function (err) {
    if (err) throw err;
});

var User_trial = function () {}


User_trial.prototype.update_status_trial = function (query, callback) {
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



module.exports = User_trial;