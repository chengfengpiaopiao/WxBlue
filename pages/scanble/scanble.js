/**
 * 搜索设备界面
 */
var utils = require('../../utils/util');
var temp = [];
var that ;
Page({
  data: {
    list: []
  },
  onLoad: function () {
    that= this;
    /*****获取所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备****/
    wx.getBluetoothDevices({
      success: function (res) {
        if (res.devices.length > 0) {
          temp = res.devices
          for(var i = 0 ; i < temp.length ; i ++){
            temp[i].advertisData = that._arrayBufferToBase64(temp[i].advertisData)
          }
          that.setData({
            list: temp
          });
        }
      },
      fail: function (res) {
        console.error("wx.getBluetoothDevices", res);
      }
    })
  },

  onShow:function(){
    /*****监听寻找到新设备的事件****/
    wx.onBluetoothDeviceFound(function (devices) {
      console.info("[/wx_FOUND]new device list has founded", devices.devices[0]);//devices
      console.log('设备RSSI' + devices.devices[0].RSSI)
      console.log('设备id' + devices.devices[0].deviceId)
      console.log('设备name' + devices.devices[0].name)
      console.log('设备advertisServiceUUIDs' + devices.devices[0].advertisServiceUUIDs)
      console.log("设备的advertisData" + that._arrayBufferToBase64(devices.devices[0].advertisData));
      devices.devices[0].advertisData = that._arrayBufferToBase64(devices.devices[0].advertisData);
      temp.push(devices.devices[0])
      that.setData({
        list: temp
      })
    })

    /*****监听蓝牙适配器状态变化事件****/
    wx.onBluetoothAdapterStateChange(function (res) {
      //console.log("蓝牙适配器状态变化", res)
      //utils.showWrapLoading({ "title": "蓝牙适配器", mask: true, duration: 2000 });
    })
  },

  onHide:function(){
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.info("[/wx-stopBluetoothDevicesDiscovery]", res)
      }
    })
  },

  serachBlue: function () {
    var that = this;
      /*****开始搜寻附近的蓝牙外围设备。(耗时操作)****/
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.info("[/wx_Discovery]开始搜索附近蓝牙设备",res)
      },
      fail: function (res) {
        console.error("[/wx_Discovery]搜索失败", res);
        if (res.errCode == 10001) {
          wx.showModal({
            title: ' 温馨提示',
            content: '请打开蓝牙设置',
            success: function (res) {
              if (res.confirm) {
              }
            }
          })
        }
      },
      complete:function(res){
        // console.log("....startDiscovery",res);
        // //查询到可以连接的蓝牙设备
        // wx.onBluetoothDeviceFound(function (devices) {
        //   //console.log(devices)
        //   console.log('new device list has founded')
        //   console.log("----new----", devices.devices[0]);//devices
        //   console.log('设备RSSI' + devices.devices[0].RSSI)
        //   console.log('设备id' + devices.devices[0].deviceId)
        //   console.log('设备name' + devices.devices[0].name)
        //   console.log('设备advertisServiceUUIDs' + devices.devices[0].advertisServiceUUIDs)
        //   console.log("设备的advertisData" + that._arrayBufferToBase64(devices.devices[0].advertisData)) ;
        //   devices.devices[0].advertisData = that._arrayBufferToBase64(devices.devices[0].advertisData);
        //   temp.push(devices.devices[0])
        //   that.setData({
        //     list: temp
        //   })
        // })
      }
    })
  },

  //页面路由 conn
  bindViewTap: function (e) {
    // wx.stopBluetoothDevicesDiscovery({
    //   success: function (res) {
    //     console.log(res)
    //   }
    // })
    var title = e.currentTarget.dataset.title;
    var name = e.currentTarget.dataset.name;
    wx.showLoading({
      title: '传入的设备id:' + title,
    })
    setTimeout(function(){
      wx.hideLoading()
    },2000);
    wx.navigateTo({
      url: '../conn/conn?deviceId=' + title + '&name=' + name
    })
  },

  _base64ToArrayBuffer(base64) {
    var binary_string = base64;
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  },

  _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  }

})
