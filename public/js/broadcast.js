var hostname = location.protocol + "//" + location.host;
var recorder;

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

// ......................................................
// .......................UI Code........................
// ......................................................
window.enableAdapter = true; // enable adapter.js
var connection = new RTCMultiConnection();

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}


var cameraSelectionContainer = document.querySelector('#cameras-selection-container');
connection.videosContainer = document.getElementById('videos-container');

navigator.mediaDevices.enumerateDevices()
    .then(gotDevices).then(getStream).catch(handleError);

function gotDevices(deviceInfos) {
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || 'camera ' +
                (cameraSelectionContainer.length + 1);
            cameraSelectionContainer.appendChild(option);
        } else {
            console.log('Found one other kind of source/device: ', deviceInfo);
        }
    }
}

cameraSelectionContainer.onchange = getStream;

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    var constraints = {
        audio: true,
        video: {
            deviceId: {exact: cameraSelectionContainer.value}
        }
    };
    navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    connection.videosContainer.innerHTML = '';
    var video = document.createElement('video');
    video.setAttributeNode(document.createAttribute('autoplay'));
    video.setAttributeNode(document.createAttribute('playsinline'));
    video.muted = true;
    video.volume = 0;
    video.srcObject = stream;
    video.setAttribute('controls', true);
    video.setAttribute('id', 'video-preview');
    video.style.width = '100%';
    connection.videosContainer.appendChild(video);
}

function handleError(error) {
    console.log('Error: ', error);
}

function querySelectorAll(selector, element) {
    element = element || document;
    return Array.prototype.slice.call(element.querySelectorAll(selector));
}


function saveToDisk(blob, fileName) {
    if (blob.size && blob.type) FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
    else FileSaver.SaveToDisk(blob, fileName);
}

var FileSaver = {
    SaveToDisk: invokeSaveAsDialog
};


function invokeSaveAsDialog(fileUrl, fileName) {
    /*
    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }
    */

    var hyperlink = document.createElement('a');
    hyperlink.href = fileUrl;
    hyperlink.target = '_blank';
    hyperlink.download = fileName || fileUrl;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}


var startStream = document.getElementById('start-stream');
startStream.onclick = function () {
    if (startStream.getAttribute('start') == 'true') {
        connection.attachStreams.forEach(function(stream) {
            stream.stop();
        });
        //recording stop
        recorder.stopRecording(function (dataRecord) {
            connection.videosContainer.innerHTML = '';
            var video = document.createElement('video');
            video.setAttribute('controls', true);
            video.setAttribute('src', dataRecord);
            video.setAttribute('autoplay', true);
            document.getElementById('lived').innerText = "Phát lại";
            startStream.style.display = 'none';
            connection.videosContainer.appendChild(video);

            var recordedBlob = recorder.getBlob();
            console.log(recordedBlob);
            BootstrapDialog.show({
                title: 'Stream kết thúc',
                message: 'Bạn muốn lưu video này ở đâu ?',
                buttons: [{
                    label: 'Lưu vào máy',
                    action: function(dialog) {
                        saveToDisk(recordedBlob);
                    }
                }, {
                    label: 'Lưu máy chủ',
                    action: function(dialog) {
                        var formData = new FormData();
                        formData.append('file', recordedBlob);
                        formData.append('record_code', roomid);
                        $.ajax({
                            url : '/upload_video',
                            method: "POST",
                            data: formData,
                            contentType: false,
                            processData: false,
                            success : function (data) {
                                if(data.result == "OK"){
                                    dialog.close();
                                    alert('Đã lưu video vào máy chủ');
                                }else{
                                    alert('Vui lòng thử lại!!');
                                }

                            },
                            error : function (err) {
                                alert('Vui lòng thử lại!!');
                            }
                        });
                    }
                }]
            });

        });

        this.innerText = 'Bắt đầu phát trực tiếp';
        this.setAttribute('start', 'false');
        var  socket = connection.getSocket();
        socket.emit('update_stream', {recordCode : roomid, status : false});

    }else{

        if(cameraSelectionContainer.value == '') return;
        if(!connection.attachStreams.length) {
            connection.mediaConstraints.video.optional = [{
                sourceId: cameraSelectionContainer.value
            }];
            connection.open(roomid);
            return;
        }
        if(!connection.getAllParticipants().length) {
            connection.attachStreams.forEach(function(stream) {
                stream.stop();
            });

            connection.mediaConstraints.video.optional = [{
                sourceId: cameraSelectionContainer.value
            }];
            connection.open(roomid);
            return;
        }

        connection.attachStreams.forEach(function(stream) {
            stream.stop();
        });

        connection.mediaConstraints.video.optional = [{
            sourceId: cameraSelectionContainer.value
        }];

        setTimeout(function() {
            connection.addStream(connection.session);
        }, 300);
    }
}

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

// connection.socketCustomEvent = 'custom-message';
// var  socket = connection.getSocket();
//
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

// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'video-broadcast-demo';
connection.socketCustomParameters = '&type=broadcast';

connection.session = {
    audio: true,
    video: true,
    oneway: true,
    data: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

connection.onstream = function(event) {
    connection.videosContainer.innerHTML = '';
    event.mediaElement.width = '100%';
    event.mediaElement.removeAttribute('controls');
    event.mediaElement.setAttribute('id', event.streamid);
    connection.videosContainer.appendChild(event.mediaElement, connection.videosContainer.firstChild);
    document.getElementById('text-box').removeAttribute('disabled');
    document.getElementById('lived').innerText = 'Trực tiếp';
    startStream.innerText = 'Kết thúc';
    startStream.setAttribute('start', 'true');
    cameraSelectionContainer.setAttribute('disabled', true);
    // openVideo(video, event.userid);
    // mediaElement.id = event.streamid;
    var  socket = connection.getSocket();
    getInfoUser(socket);
    socket.emit('update_stream', {recordCode : event.userid, status : true});

    //recording start
    recorder = RecordRTC(event.stream, {
        type: 'video'
    });
    recorder.startRecording();

};

function openVideo(video, userid){
    var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
    var mediaElement = getHTMLMediaElement(video, {
        title: userid,
        buttons: [],
        // width: width,
        showOnMouseEnter: false
    });

    connection.videosContainer.appendChild(mediaElement);
    setTimeout(function() {
        mediaElement.media.play();
    }, 5000);
}

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        // mediaElement.parentNode.removeChild(mediaElement);

        if(event.userid === connection.sessionid && !connection.isInitiator) {
          alert('Phát trực tiếp đã kết thúc, hẹn bạn lần sau!!.');
        }
    }
};

connection.onMediaError = function(e) {
    if (e.message === 'Concurrent mic process limit.') {
        if (DetectRTC.audioInputDevices.length <= 1) {
            alert('Please select external microphone. Check github issue number 483.');
            return;
        }

        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        connection.mediaConstraints.audio = {
            deviceId: secondaryMic
        };

        connection.join(connection.sessionid);
    }
};

// ..................................
// ALL below scripts are redundant!!!
// ..................................

// ......................................................
// ......................Handling Room-ID................
// ......................................................

if (roomid && roomid.length) {
    // connection.open(roomid);
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
    var avatar = '';
    if(event.user.avatar){
        avatar = hostname_+'/'+event.user.avatar;
    }else{
        avatar = hostname+'/img/avatar.png';
    }
    var html = '';
    html += '<div class="chat_list">' +
        '<div class="chat_people">' +
        '<div class="chat_img"> <img src="'+avatar+'" alt="sunil"> </div>' +
        '<div class="chat_ib">' +
        '<h5>'+event.user.fullname+'<span class="chat_date"></span></h5>' +
        '<p id="comment">'+event.message+'</p>' +
        '</div></div></div>';

    container.append(html);
}



// detect 2G
if(navigator.connection &&
   navigator.connection.type === 'cellular' &&
   navigator.connection.downlinkMax <= 0.115) {
  alert('2G is not supported. Please use a better internet service.');
}
