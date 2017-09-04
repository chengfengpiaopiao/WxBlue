var Crypto = require('./cryptojs/cryptojs.js').Crypto;
var app = getApp();
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  Encrypt: Encrypt,
  Decrypt: Decrypt
}


function Encrypt(word) {
  var mode = new Crypto.mode.CTR(Crypto.pad.NoPadding);

  var eb = word
  //return (options && options.asBytes) ? m : util.bytesToHex(m);//数据转换

  //var eb = [0xDC, 0xB4, 0xEF, 0x4B, 0xA9, 0x50, 0x4D, 0x81, 0xC0, 0xE1, 0x63, 0x1B, 0x86, 0xF1, 0xC2,0x8F];
  var kb = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]
  var vb = [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7,0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]
  var ub = Crypto.AES.encrypt(eb, kb, { iv: vb, mode: mode, asBpytes: true });
  return ub;
  //message, password, options
}

function Decrypt(word) {
  var mode = new Crypto.mode.CTR(Crypto.pad.NoPadding);
  var eb = Crypto.util.hexToBytes(word);
  // var eb = [0xDC, 0xB4, 0xEF, 0x4B, 0xA9, 0x50, 0x4D, 0x81, 0xC0, 0xE1, 0x27, 0x4D, 0xDC, 0xDF, 0xE3, 0xA2, 0x0F, 0x1B]
  var kb = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]
  var vb = [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff]
  var ub = Crypto.AES.decrypt(eb, kb, { asBpytes: true, mode: mode, iv: vb });
  
  return ub;
}

function Str2Bytes(str) {
  var pos = 0;
  var len = str.length;
  if (len % 2 != 0) {
   return null;
  }
  len /= 2;
  var hexA = new Array();
  for (var i = 0; i < len; i++) {
    var s = str.substr(pos, 2);
    var v = parseInt(s, 16);
    hexA.push(v);
    pos += 2;
  }
  return hexA;
}


//字节数组转十六进制字符串

function Bytes2Str(arr) {
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    var tmp = arr[i].toString(16);
    if (tmp.length == 1) {
      tmp = "0" + tmp;
    }
    str += tmp;
  }
  return str;
}