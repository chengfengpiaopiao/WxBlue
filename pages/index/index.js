//index.js
//获取应用实例
var app = getApp()
var utils = require('../../utils/util');
var encStr;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    encryptData: "",
    decryptData: ""
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //事件处理函数
  bindViewTap1: function () {
    this.openBlue();
  },

  openBlue: function () {
    wx.openBluetoothAdapter({
      success: function (res) {
        //获取本机蓝牙适配器状态
        wx.navigateTo({
          url: '../scanble/scanble'
        })
      },
      fail: function (res) {
        // wx.showToast({
        //   title: '请打开手机蓝牙',
        //   duration: 2000
        // })
        wx.showModal({
          title: ' 温馨提示',
          content: '请打开蓝牙设置',
          success: function (res) {
            if (res.confirm) {
            }
          }
        })
      }
    })
  },

  onLoad: function () {
    console.log('onLoad')
  
    var that = this



    // var typedArray = new Uint8Array([1, 2, 3, 4]);
    // console.log("bufferLength = ",typedArray.byteLength);
    // console.log(Array.from(typedArray));




    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo) {
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo
    //   })
    // })



  },
  encrypting: function () {

    
    // var data = "f0f2f3f5f3";
    // console.log(this.Str2Bytes(data));

    var time = new Date().getTime();
    console.log(time);
    app.globalData.time = time;
    var dataStr = "0823111444unlock"
    var dataArray = this.strToHexCharCode(dataStr);
    console.log("dataArray", dataArray);
    encStr = utils.Encrypt(dataStr);
    
    console.log("加密后的结果为===", encStr.length);
    console.log(encStr);
    this.setData({
      encryptData: encStr
    })
  },
  decrypting: function () {
    //var str = utils.Decrypt("DCB4EF4BA9504D81C0E1274DDCDFE3A20F1B");
    var str = utils.Decrypt("dcb4ee43a8524e84c2e1631b86f1c28f");
    console.log("解密后的信息为为==", str);
    this.setData({
      decryptData: str
    })
  },
  strToHexCharCode: function (str) {
    if (str === "")
      return "";
    var hexCharCode = [];
    
    for (var i = 0; i < str.length; i++) {
      hexCharCode.push(parseInt(str.charCodeAt(i).toString(16)));
    }
    return hexCharCode;
  },
  Str2Bytes: function (str) {
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
})
