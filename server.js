var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var fs = require('fs');
const url = require('url');

var bodyParser = require('body-parser');

var logger = require('morgan');
var mongoose = require('mongoose');

//load core
var Constant = require('./core/constant.js');
var Common = require('./core/common.js');
var common = new Common();

var isUserHTTPs = Constant.isUseHTTPs;
var http_server = require(isUserHTTPs ? 'https' : 'http');

// var  Youtube = require("youtube-api");
// var gapi = require('./lib/gapi');
// var readJson = require("r-json");
// var Logger = require("bug-killer");
// var opn = require('opn');
// var Spinner = require('cli-spinner').Spinner;
// var spinner = new Spinner('uploading.. %s');
// spinner.setSpinnerString('|/-\\');

var Storage = require('@google-cloud/storage');
var Promise = require('bluebird');
var GoogleCloudStorage = Promise.promisifyAll(Storage);

var storage = GoogleCloudStorage({
    projectId: 'buoyant-program-209206',
    keyFilename: __dirname+'/service-account.json'
})

var BUCKET_NAME  = "upload_video_toidayhoc";
var myBucket = storage.bucket(BUCKET_NAME);




 if(isUserHTTPs){
     //ssl
     var options = {
         key: fs.readFileSync(path.resolve(Constant.PRIV_KEY_PATH)),
         cert: fs.readFileSync(path.resolve(Constant.CERT_KEY_PATH))
     };
     var server = http_server.createServer(options, app);
 }else{
     var server = http_server.createServer(app);
 }
//


// var io = require('socket.io')(server);
// view engine setup
app.engine('ejs', require('express-ejs-extend')); // add this line
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var User_tmp = require('./models/User_tmp.js');
var Record_data = require('./models/Record_data.js');
var User_trial = require('./models/user_trial_record.js');
var Record_file = require('./models/Record_file.js');
var user_tmp = new User_tmp();

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname+'/public/uploads/video_tmp');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+'.webm');
    }
});
var upload = multer({storage: storage});


app.post('/update_stream', function (req, res) {
    var record = new Record_data();
    var record_code = req.body.record_code;
    var status = req.body.status;
    var query = "UPDATE record  SET status_stream="+status+" WHERE code='"+record_code+"'";
    record.update_stream(query, function (result) {
        res.send(result);
    });
});

// app.post('/update_trial', function (req, res) {
//     var user_trial = new User_trial();
//     var record_code = req.body.record_code;
//     var user_id = req.body.user_id;
//     var status = req.body.status;
//     var query = "UPDATE user_trial_record " +
//         "JOIN record ON user_trial_record.record_id = record._id SET is_trialed=1  " +
//         "WHERE record.code ='"+record_code+"' AND user_trial_record.user_id="+user_id;
//     user_trial.update_status_trial(query, function (result) {
//         res.send(result);
//     });
// });

app.post('/upload_video', upload.single('file'), function (req, res){
    var file = myBucket.file(req.file.filename);
    file.existsAsync()
        .then(exists => {
            if (exists){
                console.log('file existed');
            }
        })
        .catch(err => {
            return err;
        })

    //blob:http://localhost:3000/c35f7f12-4d7e-4717-806c-eff2bc52c072
    let localFileLocation = req.file.path;
    myBucket.uploadAsync(localFileLocation, {public : true})
        .then(file => {
            fs.unlink(__dirname+'/public/uploads/video_tmp/'+file.name,function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
            var urlfile = getPublicThumnailUrlForItem(file.name);
            var record_file = new Record_file();
            var record_data = new Record_data();
            record_data.get_id(req.body.record_code, function (result) {
                var query = 'INSERT INTO record_file ' +
                    '(file_name, file_type, file_src, file_size, record_id)' +
                    'VALUE ("'+req.file.filename+'", ' +
                    '"'+req.file. mimetype+ '", ' +
                    '"'+urlfile+ '", ' +
                    '"'+req.file.size+ '", ' +
                    '"'+ result.data+ '") ';

                record_file.insert_record_file(query, function (data_result) {
                    var resp = {
                        result : 'OK',
                        data : urlfile
                    }
                    res.send(resp);
                })
            });
        });
});

function getPublicThumnailUrlForItem (file_name){
    return `https://storage.googleapis.com/${BUCKET_NAME}/${file_name}`
}


// app.get('/oauth2callback', function(req, res) {
//     let code = req.query.code;
//
//     Logger.log("Trying to get the token using the following code: " + code);
//
//     gapi.oauth.getToken(code, (err, tokens) => {
//
//         if (err) {
//             console.error(err)
//             res.status(500).send(err)
//             return Logger.log(err);
//         }
//
//         Logger.log("Got the tokens.");
//
//         gapi.oauth.setCredentials(tokens);
//
//         res.send("The video is being uploaded. Check out the logs in the terminal.");
//
//         let req = Youtube.videos.insert({
//             resource: {
//                 // Video title and description
//                 snippet: {
//                     title: currentVideo.title
//                     , description: currentVideo.description
//                 }
//
//                 , status: {
//                     privacyStatus: currentVideo.privacyStatus
//                 }
//             }
//             // This is for the callback function
//             , part: "snippet,status"
//
//             , media: {
//                 body: currentVideo.video
//             }
//         }, (err, data) => {
//             if (data) {
//                 socket.emit('done', currentVideo);
//                 spinner.stop(true)
//                 Logger.log('Done!')
//             }
//             if (err) {
//                 console.error(err)
//             }
//         });
//         spinner.start();
//     });
// });


app.post('/record_info', function(req, res){
    var record_code = req.body.record_code;
    var query = "SELECT `record`.`_id`, `record`.`title`, `category`.`name` as `category_name`,`account`.`fullname`, `city`.`name` as `city_name`, `district`.`name` as `district_name` " +
        "FROM `record` " +
        "JOIN `city` ON `record`.`city_id` = `city`.`city_id` " +
        "JOIN `district` ON `record`.`district_id` = `district`.`district_id` " +
        "JOIN `category_has_record` ON `category_has_record`.`record_id` = `record`.`_id` " +
        "JOIN `category` ON `category`.`_id` = `category_has_record`.`category_id` " +
        "LEFT JOIN `account` ON `account`.`_id` = `record`.`created_by` " +
        "WHERE `record`.`is_active` = 1 AND `record`.`is_delete` =0 AND `record`.`status_stream` = 1 AND record.code='"+record_code+"'";
    user_tmp.get_info(query, function (result) {
        res.send(result.data[0]);
    });
});

app.get('/stream', (req, res)=> res.render('broadcast'));
app.get('/watch', (req, res)=> res.render('watch'));

require('./Signaling-Server.js')(server, function (socket) {
    try {
        var params = socket.handshake.query;

        // "socket" object is totally in your own hands!
        // do whatever you want!

        // in your HTML page, you can access socket as following:
        // connection.socketCustomEvent = 'custom-message';
        // var socket = connection.getSocket();
        socket.on('get_info_user', function (userId, callback) {
            var user_id = userId.user_id;
            var query = "SELECT _id, fullname, img_src FROM account WHERE _id="+user_id;
            user_tmp.get_info(query, function (result) {
                callback(result.data[0]);
            });
        });

        socket.on('update_stream', function (data) {
            var record = new Record_data();
            var record_code = data.recordCode;
            var status = data.status;
            var query = "UPDATE record  SET status_stream="+status+" WHERE code='"+record_code+"'";
            record.update_stream(query, function (result) {});
        });
        
        socket.on('update_trial', function (data) {
            var user_trial = new User_trial();
            var record_code = data.record_code;
            var user_id = data.user_id;
            var query = "UPDATE user_trial_record " +
                "JOIN record ON user_trial_record.record_id = record._id SET is_trialed=1  " +
                "WHERE record.code ='"+record_code+"' AND user_trial_record.user_id="+user_id;
            user_trial.update_status_trial(query, function (result) {});
        });
        
        socket.on('disconnect',function () {
            if(params.type == 'broadcast'){

                var record = new Record_data();
                var record_code = params.userid;
                var status = false;
                var query = "UPDATE record  SET status_stream="+status+" WHERE code='"+record_code+"'";
                record.update_stream(query, function (result) {});
            }
        });

        if (!params.socketCustomEvent) {
            params.socketCustomEvent = 'custom-message';
        }

        socket.on(params.socketCustomEvent, function(message) {
            try {
                socket.broadcast.emit(params.socketCustomEvent, message);
            } catch (e) {}
        });
    } catch (e) {}
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});
