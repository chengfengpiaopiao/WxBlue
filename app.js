//app.js
var utils = require('./utils/util');
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //String转Ascii  $unlock
    //36 117 110 108  111 99 107
    var dataStr = "$unlock;"
    var asciiData = ""

    /*遍历字符串中的每个字符*/
    for (var i = 0; i < dataStr.length; i++) {
      var c = dataStr.charAt(i);
      asciiData += c.charCodeAt()
    }
    console.log(asciiData);

    /******** */
    // this.testObject();
    // this.testPromise();
    let destArray = this.calXios([1900, 1900,1986,1000,1700,1680,1389]);
    console.info(destArray);
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  /***************************test*********************** */
  testPromise:function(){
    //utils.showWrapLoading({ "title": "连接低功耗蓝牙中", mask: true, duration: 2000 });
    var show = utils.wxWrap(wx.showLoading)
    show({
      "title": "连接设备中",
      mask: true,
      duration: 4000
    }).then(function(){
      show({
        "title": "连接设备中2",
        mask: true,
        duration: 2000
      }).then(function(){
        setTimeout(function(){
          show({
            "title": "连接设备中3",
            mask: true,
            duration: 6000
          })
        },2000);

      });
    });
  },

  testObject:function(){
      console.info("[/原型]",Object);
      console.log("[/原型]protoType",Object.prototype);//构造器
      console.log("[/原型]constructor", Object.prototype.constructor);
      console.log("[/原型]Objecy._proto_", Object._proto_);

      function Person(name, age) {
        this.name = name;
        this.age = age;
      }
      Person.prototype.MaxNumber = 9999;
      Person.__proto__.MinNumber = -9999;
      var will = new Person("Will", 28);
      console.log(will.MaxNumber); // 9999 
      console.log(will.MinNumber); // undefined 
  },

  globalData: {
    userInfo: null,
    time: "",
    connectedDevices:[]
  },
  /***********************lifeCycle************************ */
  onHide:function(){
    console.error("[/app-cycle]");
  },

  /***********************utils************************ */
  calXios:function(originArray){
    //0-4095
    var start = 0;
    var end = 4095;
    var height = 486
    return originArray.map(function(item){
      return parseFloat(((item - start) / (end - start) * 486).toFixed(2))
    })
  }
})