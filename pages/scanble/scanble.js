/**
 * 搜索设备界面
 */
var temp = [];
Page({
  data: {
    logs: [],
    list: [],
    login: false
  },
  onLoad: function () {
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        if (res.devices.length > 0) {
          temp = res.devices
          for(var i = 0 ; i < temp.length ; i ++){
            temp[i].advertisData = that._arrayBufferToBase64(temp[i].advertisData )
          }
          that.setData({
            list: temp
          });
        } else {
          //监听蓝牙适配器变化
          wx.onBluetoothAdapterStateChange(function (res) {
            //console.log("蓝牙适配器状态变化", res)
          })
        }
      },
      fail: function (res) {
        console.log("wx.getBluetoothDevices", res);
      },
      complete:function(res){
        //查询到可以连接的蓝牙设备
        wx.onBluetoothDeviceFound(function (devices) {
          // console.log(devices)
          // console.log('new device list has founded')
          // console.log("----new----", devices.devices[0]);//devices
          // console.log('设备RSSI' + devices.devices[0].RSSI)
          // console.log('设备id' + devices.devices[0].deviceId)
          // console.log('设备name' + devices.devices[0].name)
          // console.log('设备advertisServiceUUIDs' + devices.devices[0].advertisServiceUUIDs)
          // console.log("设备的advertisData" + that._arrayBufferToBase64(devices.devices[0].advertisData)) ;
          devices.devices[0].advertisData = that._arrayBufferToBase64(devices.devices[0].advertisData);
          temp.push(devices.devices[0])
          that.setData({
            list: temp
          })
        })
      }
    })

  },

  serachBlue: function () {
    var that = this;
    // console.log("点击搜索");
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        // console.log("开始搜索附近蓝牙设备")
        // console.log(res)
      },
      fail: function (res) {
        console.log("搜索失败", res);
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
        console.log("....startDiscovery",res);
        //查询到可以连接的蓝牙设备
        wx.onBluetoothDeviceFound(function (devices) {
          // console.log(devices)
          // console.log('new device list has founded')
          // console.log("----new----", devices.devices[0]);//devices
          // console.log('设备RSSI' + devices.devices[0].RSSI)
          // console.log('设备id' + devices.devices[0].deviceId)
          // console.log('设备name' + devices.devices[0].name)
          // console.log('设备advertisServiceUUIDs' + devices.devices[0].advertisServiceUUIDs)
          // console.log("设备的advertisData" + that._arrayBufferToBase64(devices.devices[0].advertisData)) ;
          devices.devices[0].advertisData = that._arrayBufferToBase64(devices.devices[0].advertisData);
          temp.push(devices.devices[0])
          that.setData({
            list: temp
          })
        })
      }
    })
  },
  //点击事件处理
  bindViewTap: function (e) {
    wx.setStorageSync('machine', temp);
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
    },3000);
    wx.redirectTo({
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
