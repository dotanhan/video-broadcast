/**
 * author: Martin
 * define constants using in this project
 */

var Constant	= {
    SERVER_ERR				: 'SERVER_ERR',
    QUERY_ERR 				: 'QUERY_ERR',
    EMPTY_DATA 				: 'EMPTY_DATA',
    FAILED_CODE				: 'FAILED',
    FAILED_LOG				: 'FAILED_LOG',
    NOT_FOUND				: 'NOT_FOUND',
    FORBIITEN				: 'NOT_FOUND',
    SUPPORT				    : 'SUPPORT',
    NOT_SUPPORT				: 'NOT_SUPPORT',
    OK_CODE					: 'OK',
    LOGINED					: 'LOGINED',
    MISMATCH_PARAMS			: 'MISMATCH_PARAMS',		//wrong parameters sending to server
    MISMATCH_SOCIAL_ID		: 'MISMATCH_SOCIAL_ID',		//wrong FB or Google ID sending to server
    UTF_8					: 'UTF-8',
    TRUE					: true,
    FALSE					: false,
    //
    NOT_DATA				: 'NOT_DATA',
    NOT_EXISTED				: 'NOT_EXISTED',
    NOT_MATH_PASSWORD		: 'NOT_MATH_PASSWORD',
    EXISTED					: 'EXISTED',
    //
    USERNAME_NOT_EXISTED    : "USERNAME_NOT_EXISTED",
    INFO_USER_NOT_EXISTED   : "INFO_USER_NOT_EXISTED",
    //
    USERNAME_AVAILABLE		: 'USERNAME_AVAILABLE',
    TYPE_MESSAGE            : {
        SINGLE  : "SINGLE",
        FILE    : "FILE",
        IMAGE   : "IMAGE",
        AUDIO   : "AUDIO",
        TEXT    : "TEXT"
    },
    isUseHTTPs : false,
    PRIV_KEY_PATH : '/etc/letsencrypt/live/staging.toidayhoc.com/privkey.pem',
    CERT_KEY_PATH : '/etc/letsencrypt/live/staging.toidayhoc.com/cert.pem'
};
//
module.exports = Constant;