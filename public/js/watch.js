var hostname = location.protocol + "//" + location.host;

// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................


// ......................................................
// .......................UI Code........................
// ......................................................


(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}

var connection = new RTCMultiConnection();
// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

// var socket = connection.getSocket();
//
// socket.emit('getInfoRecord', {recordCode : roomid}, function (data) {
//
// });

// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'video-broadcast-demo';
connection.socketCustomParameters = '&type=watche';

connection.session = {
    // audio: true,
    // video: true,
    // oneway: true,
    data : true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

var dataUser = {
    fullname : '',
    avatar :  '',
    user_id : ''
}
function getInfoUser(socket){
    var user_id = params.id;

    socket.emit('get_info_user',{user_id : user_id}, function (data) {
        dataUser.fullname = data.fullname;
        dataUser.avatar = data.img_src;
        dataUser.user_id = data._id;
    });
}

connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
    event.mediaElement.width = '100%';
    event.mediaElement.backgound = 'black';
    connection.videosContainer.appendChild(event.mediaElement, connection.videosContainer.firstChild);
    var  socket = connection.getSocket();
    getInfoUser(socket);

    var trial_status = params.trial;
    var user_id = params.id;
    if(trial_status && trial_status == 'true'){
        socket.emit('update_trial',{user_id : user_id, record_code : roomid}, function (data, status) {});
    }
};

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);

        if(event.userid === connection.sessionid && !connection.isInitiator) {
            alert('Phát trực tiếp đã kết thúc, hẹn bạn lần sau!!.');
            // location.reload();
        }
    }
};

connection.onMediaError = function(e) {
    if (e.message === 'Concurrent mic process limit.') {
        if (DetectRTC.audioInputDevices.length <= 1) {
            alert('Please select external microphone. Check github issue number 483.');
            return;
        }
    }
};

// ..................................
// ALL below scripts are redundant!!!
// ..................................

// ......................................................
// ......................Handling Room-ID................
// ......................................................

if (roomid && roomid.length) {
    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExist) {
            if (isRoomExist) {
                connection.sdpConstraints.mandatory = {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                };
                connection.join(roomid);
                return;
            }else{
                alert('Phát trực tiếp đã ngừng!!.');
                window.close();
                return;
            }
            setTimeout(reCheckRoomPresence, 5000);
        });
    })();
}



// detect 2G
if(navigator.connection &&
    navigator.connection.type === 'cellular' &&
    navigator.connection.downlinkMax <= 0.115) {
    alert('2G is not supported. Please use a better internet service.');
}


connection.onmessage = function (event) {
    var data = event.data;
    appendDIV(data);
};


document.getElementById('text-box').onkeyup = function (e) {
    if (e.keyCode != 13) return;

    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    var data = {user : dataUser, message : this.value};
    connection.send(data);
    appendDIV(data);
    this.value = '';
    this.focus();
};

document.getElementById('msg_send_btn').onclick = function (e) {

    var textbox = document.getElementById('text-box');

    // removing trailing/leading whitespace
    this.value = textbox.value.replace(/^\s+|\s+$/g, '');
    if (!textbox.value.length) return;
    var data = {user : dataUser, message : textbox.value};
    connection.send(data);
    appendDIV(data);
    textbox.value = '';
    textbox.focus();
};



function appendDIV(event) {
    var container = $('div#chat-list');
    var hostname_ = location.protocol + "//" + location.hostname;
    var html = '';
    var avatar = '';
    if(event.user.avatar){
        avatar = hostname_+'/'+event.user.avatar;
    }else{
        avatar = hostname+'/img/avatar.png';
    }
    html += '<div class="chat_list">' +
        '<div class="chat_people">' +
        '<div class="chat_img"> <img src="'+avatar+'"  alt="sunil"> </div>' +
        '<div class="chat_ib">' +
        '<h5>'+event.user.fullname+'<span class="chat_date"></span></h5>' +
        '<p id="comment">'+event.message+'</p>' +
        '</div></div></div>';

    container.append(html);
}


window.onload = function(e){
    $.post('/record_info',{record_code : roomid}, function (data, status) {
        $('#center_name').text(data.fullname);
        $('#record_name').text(data.title);
        $('#category_name').text(data.category_name);
    });
}