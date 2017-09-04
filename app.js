//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setStorage({
      key: "machine",
      data: []
    })

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
},
  getUserInfo:function (cb) {
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
  globalData:{
    userInfo: null,
    time:""
  }
})