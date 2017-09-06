var Crypto = require('../../utils/cryptojs/cryptojs.js').Crypto;
var Bluetooth = require('../../utils/util').Bluetooth;
var utils = require('../../utils/util');
var hasInit = false
var deviceSendData = false;
var getInfoTimer = undefined;

var that;
Page({
  data: {
    userInfo: {},
    deviceId: '',
    name: '',
    serviceId: '',
    services: [],
    cd20: '',
    cd01: '',
    cd02: '',
    cd03: '',
    cd04: '',
    characteristics20: null,
    characteristics01: null,
    characteristics02: null,
    characteristics03: null,
    characteristics04: null,
    result: "",
    inputValue: "",
    mcuid: "",
    togtherTime: "",
    lockState: false,
    sending: false,
    lockData: "开锁",
    encryDataStr: ""
  },

  onLoad: function (option) {
    that = this;
    utils.showWrapLoading({ "title": "连接低功耗蓝牙中", mask: true, duration: 2000 });
    that.setData({ deviceId: option.deviceId });
    that.setData({ name: option.name });
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        utils.showWrapLoading({ "title": "硬件连接成功", mask: true, duration: 2000 });
        wx.getBLEDeviceServices({
          deviceId: that.data.deviceId,
          success: function (res) {
            var servicesStr = res.services;
            that.setData({ services: servicesStr });
          }
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '连接失败',
          duration: 2000
        })
        wx.hideLoading();
      },
      complete: function (res) {
      }
    })
  },

  onShow: function () {
    //监听硬件连接状态
    wx.onBLEConnectionStateChanged(function (res) {
    })
    getInfoTimer = undefined;
  },

  getCharaties: function (uuid) {
    var that = this;
    setTimeout(function () {
      wx.getBLEDeviceCharacteristics({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices
        deviceId: that.data.deviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: uuid,
        success: function (res) {
          var characteristicsStr = res.characteristics;
          that.setData({ characteristics: characteristicsStr });
        }, fail: function (res) {
          console.log(res);
        },
        complete: function () {
          wx.hideLoading()
        }

      })
    }, 1500);

  },

  //开锁
  bindUnlock: function () {
    that.sendGetInfo();
  },

  sendGetInfo: function () {
    deviceSendData = false;//重新获取gitInfo
    var promiseRetryInstance = utils.promiseRetry({ times: 2, delay: 3000 });
    return promiseRetryInstance(that.sendDataToDev)
      .then(function () {
        console.log("[/resolve]", "发送ok  deviceSendData : " + deviceSendData);
      //1轮询getInfo的数据
        if (!deviceSendData) {
          let times = 0
          if (!getInfoTimer) {
            if (deviceSendData){
              return;
            }
            getInfoTimer = setInterval(function () {
              console.error("deviceSendData", deviceSendData);
              console.info("times", times);
              that.sendDataToDev(that.data.cd20, "$getinfo;")//Promise
              times++;
              // if (times > 2) {
              //   clearInterval(getInfoTimer);
              // }
              if (deviceSendData){
                clearInterval(getInfoTimer);
              }
            }, 1000);
          }
        }else{
          Promise.resolve();
        }
    }, function (rejectData) {
      console.log("[/reject]", rejectData);
      utils.showWrapLoading({
        "title": data,
        mask: true,
        duration: 2000
      });
      clearInterval(getInfoTimer);
    });
  },

  sendDataToDev: function (chara, aim){
    console.log("sending.................................");
    var arrayBuffer = new ArrayBuffer();
    var charaStr = chara;
    let dataView = undefined;
    switch (aim){
      case "$getInfo;":
        arrayBuffer = that._base64ToArrayBuffer(aim);
        console.info("[/GET-INFO]app 发送数据 to 设备 ", that._arrayBufferToBase64(arrayBuffer));
      break;
      case "unlock":
        var encryptData = utils.Encrypt(that.data.togtherTime + "unlock");
        var valueArray = Crypto.util.hexToBytes("24" + encryptData + "3b");
        console.info("[/unlock]", valueArray);
        arrayBuffer = new ArrayBuffer(valueArray.length)
        dataView = new DataView(arrayBuffer)
        for (let i = 0; i < valueArray.length; i++) {
          dataView.setUint8(i, valueArray[i])
        }
      break;
      case "lock":
        var encryptData = utils.Encrypt(that.data.togtherTime + "lock");
        var valueArray = Crypto.util.hexToBytes("24" + encryptData + "3b");
        console.info("[/lock]", valueArray);
        arrayBuffer = new ArrayBuffer(valueArray.length)
        dataView = new DataView(arrayBuffer)
        for (let i = 0; i < valueArray.length; i++) {
          dataView.setUint8(i, valueArray[i])
        }
      break;
      default:
        if(!aim){
          aim = "$getInfo;"
        }
        arrayBuffer = that._base64ToArrayBuffer(aim);
        console.info("[/GET-INFO]app 发送数据 to 设备", that._arrayBufferToBase64(arrayBuffer));
      break
    }

    if (!charaStr){
      charaStr = that.data.cd20
    }
    return Bluetooth.util.writeDataToDevice({ //reject会重发两次 Promise
      "deviceId": that.data.deviceId,
      "serviceId": that.data.serviceId,
      "characteristicId": charaStr
    }, arrayBuffer)
  },

  //解密getInfo数据
  dealdeviceGetInfo: function (dataView,STATE){
    var dataToStr = ""
    for (let i = 1; i < dataView.byteLength - 1; i++) {//字节数组转16进制
      var orign = dataView.getUint8(i).toString(16);//十进制转16进制
      var data = "0"
      if (orign.length < 2) {
        data += orign
        dataToStr += data
      } else {
        dataToStr += orign
        data += orign
      }
    }

    console.log("[/device]设备 返回数据 to app string: ", dataToStr);
    var decryptData = utils.Decrypt(dataToStr);

    switch(STATE){
      case "GET":
        var mcuid = decryptData.substring(decryptData.length - 8, decryptData.length);
        var togtherTime = decryptData.substring(0, 10);
        console.log("[/getInfo]设备 返回数据 to app mcuid: ", mcuid);
        console.log("[/getInfo]设备 返回数据 to app togtherTime: ", togtherTime);
        that.setData({
          mcuid: mcuid,
          togtherTime: togtherTime
        });
        //开锁 || 关锁
        clearInterval(getInfoTimer);
        if (!that.data.lockState) {
          that.sendDataToDev(that.data.cd20, "unlock")
        } else {
          that.sendDataToDev(that.data.cd20, "lock")
        }
      break;
      case "LOCK":
        var togtherTime = decryptData.substring(0, 10);
        var stateRETURN = decryptData.substring(10, decryptData.length);
        console.log("[/LOCK]设备 返回数据 to app togtherTime: ", togtherTime);
        console.log("[/LOCK]设备 返回数据 to app stateRETURN: ", stateRETURN);
        if (stateRETURN == "unlocked"){
          that.setData({
            lockState: true,
            lockData: "关锁"
          });
          utils.showWrapLoading({ "title": "开锁成功", mask: true, duration: 2000 });
        }
        if (stateRETURN == "locked"){
          that.setData({
            lockState: false,
            lockData: "开锁"
          }); aA
          utils.showWrapLoading({ "title": "关锁成功", mask: true, duration: 2000 });
        }
      break;
    }
  },

  developCahara: function () {
    var that = this;
    setTimeout(function () {
      wx.onBLECharacteristicValueChange(function (characteristic) {
        console.log("receiving.................................");
        let charaId = characteristic.characteristicId
        var arrayBuffer = characteristic.value
        console.log("设备 send data to 小程序 ---> " + " 字节长度  = ", arrayBuffer.byteLength);
        var dataView = new DataView(arrayBuffer)
        
        if (!hasInit && arrayBuffer.byteLength == 20){
          deviceSendData = true;//轮询
          clearInterval(getInfoTimer);
          hasInit = true;
          that.dealdeviceGetInfo(dataView,"GET"); //处理getInfo数据
          return
        }

        if (!hasInit && arrayBuffer.byteLength != 20){
          return;
        }
        that.dealdeviceGetInfo(dataView, "LOCK")
      })
 
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd01,
        state: true,
        success: function (res) {
          console.log('cd01--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          console.log('cd01--notifyBLECharacteristicValueChanged fail', res);
        },
        complete: function (res) {
        }
      })
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd02,
        state: true,
        success: function (res) {
          console.log('cd02--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          console.log('cd02--notifyBLECharacteristicValueChanged fail', res);
        },
        complete: function (res) {
        }
      })
      wx.hideLoading()
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd03,
        state: true,
        success: function (res) {
          console.log('cd03--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          console.log("cd03--notifyBLECharacteristicValueChanged fail", res);
        },
        complete: function (res) {
        }

      }, 1500);
    })

    wx.notifyBLECharacteristicValueChanged({
      // 启用 notify 功能
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.cd04,
      state: true,
      success: function (res) {
        console.log('cd04---notifyBLECharacteristicValueChanged success', res)
      },
      fail: function (res) {
        console.log('cd04---notifyBLECharacteristicValueChanged fail', res)
      }
    })

    wx.notifyBLECharacteristicValueChanged({
      // 启用 notify 功能
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.cd20,
      state: true,
      success: function (res) {
        console.log('cd20---notifyBLECharacteristicValueChanged success', res)
      },
      fail: function (res) {
        console.log('cd20---notifyBLECharacteristicValueChanged fail', res)
      }
    })
  },

  bindItemTap: function (e) {
    wx.showLoading({
      title: "正在获取特征值列表...",
      mask: false
    })
    var uuid = e.currentTarget.dataset.uuid;
    var that = this;
    that.setData({ serviceId: uuid });
    that.getCharaties(uuid);
  },

  choseCahraraTap: function (e) {
    wx.showLoading({
      title: "正在选择蓝牙特诊值...",
      mask: false
    })
    var uuid = e.currentTarget.dataset.uuid;
    var that = this;
    that.setData({ currentUUID: uuid });
    //顺序开发特征值

    that.setData({
      cd20: uuid,
    });
    console.log("-------------code20", that.data.cd20);
    //顺序开发特征值并返回数据...
    that.developCahara();
  },

  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  inputTextchange: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  frameToString: function (frame) {
    return Array.prototype.map.call(new Uint8Array(frame), x => ('00' + x.toString(16)).slice(-2)).join('')
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