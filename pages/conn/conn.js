var Crypto = require('../../utils/cryptojs/cryptojs.js').Crypto;
var utils = require('../../utils/util');
Page({
  data: {
    motto: 'Hello World',
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
    result:"",
    inputValue: "",
    mcuid: "",
    togtherTime: "",
    lockState: false,
    sending: false,
    lockData: "开锁",
    encryDataStr: ""
  },
  onLoad: function (opt) {
    wx.showLoading({
      title: "连接低功耗蓝牙中",
      mask: false
    })
    var that = this;
    console.log('传递过来的 deviceId= ' + opt.deviceId);
    console.log('传递过来的 name='  + opt.name);
    that.setData({ deviceId: opt.deviceId });
    that.setData({ name: opt.name });
    wx.onBLEConnectionStateChanged(function (res) {
      // console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    })
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          duration: 2000
        })
        wx.getBLEDeviceServices({
          deviceId: that.data.deviceId,
          success: function (res) {
            // console.log("服务列表----：", res);
            // console.log('device services:', res.services)
            var servicesStr = res.services;
            that.setData({ services: servicesStr });
            // console.log('device services:', res.services[0].uuid);//服务

            // console.log('--------------------------------------');
            // console.log('device设备的id:', that.data.deviceId);
            // console.log('device设备的服务id:', that.data.serviceId);
            /**
             * 延迟3秒，根据服务获取特征 
             */
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
  getCharaties: function (uuid) {
    var that = this;
    setTimeout(function () {
      wx.getBLEDeviceCharacteristics({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices
        deviceId: that.data.deviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: uuid,
        success: function (res) {
          // console.log("服务id获取服务特征列表----：", res);
          var characteristicsStr = res.characteristics;
          // console.log("characteristicsStr", characteristicsStr);
          // console.log("Length", characteristicsStr.length);
          that.setData({ characteristics: characteristicsStr });

          // console.log('000000000000  ' + that.data.serviceId);
          // console.log('device getBLEDeviceCharacteristics:', res.characteristics)

        }, fail: function (res) {
          console.log(res);
        },
        complete: function () {
          wx.hideLoading()
        }

      })
    }, 1500);

  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  inputTextchange: function (e) {
    // console.log(e)
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
  ,
  //开锁
  bindUnlock: function () {
    console.log("-------------------------------我是分割线--------------------------------------");
    var that = this;
    if (that.data.mcuid != "" && that.data.togtherTime != "") {
      if (that.data.lockState) {
        var encryptData = utils.Encrypt(that.data.togtherTime + "lock");
        that.writeDataToDevice("24" + encryptData + "3b");
      } else {
        var encryptData = utils.Encrypt(that.data.togtherTime + "unlock");
        that.writeDataToDevice("24" + encryptData + "3b");
      }
    } else {
      var data = "$getinfo;"
      that.writeDataToDevice(data);
    }
  },

  writeDataToDevice: function (value) {
    console.log("app 发送数据 to 设备 -----------> ", value);
    var arrayBuffer = new ArrayBuffer();
    var that = this;
    if (value == "$getinfo;") {
      arrayBuffer = that._base64ToArrayBuffer(value);
      var data = that._arrayBufferToBase64(arrayBuffer);
      //console.log("_arrayBufferToBase64 = ", data);
    } else {
      //转为字节数组
      var valueArray = Crypto.util.hexToBytes(value);
      if (that.data.lockState){
        console.log("app 发送数据 to 设备 ( 关锁 )----> ", valueArray);
      }else{
        console.log("app 发送数据 to 设备 ( 开锁 )----> ", valueArray);
      }
     
      //var vArray = new Uint8Array(valueArray);
      //arrayBuffer = new Uint8Array(valueArray).buffer;
     // console.log("bufferLength = ", arrayBuffer.byteLength);
      //console.log(Array.from(vArray));

      arrayBuffer = new ArrayBuffer(valueArray.length)
      let dataView = new DataView(arrayBuffer)
      for(let i = 0 ; i < valueArray.length ; i ++){
        dataView.setUint8(i, valueArray[i])
        // console.log("-----", dataView.getUint8(i));
      }
    }

    console.log("app 发送数据 to 设备 （ 字节长度 ） = ", arrayBuffer.byteLength);

    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.cd20,
      value: arrayBuffer,
      success: function (res) {
        // success
        console.log(res);
        wx.showToast({
          title: '指令发送成功',
          duration: 1200
        })
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '指令发送失败' + res.errCode,
          duration: 2000
        })
      },
      complete: function (res) {
      }
    })
  },
  dealWithMCUID: function (dataView, cb) {
    var that = this;
    var dataToStr = ""
    for (let i = 1; i < dataView.byteLength - 1; i++) {//字节数组转16进制
      var orign = dataView.getUint8(i).toString(16);//十进制转16进制
      // var int16 = dataView.getInt8(i)
      var data = "0"
      if (orign.length < 2) {
        data += orign
        dataToStr += data
      } else {
        dataToStr += orign
        data += orign
      }
    }
    console.log("-------设备 返回数据 to app ( $getInfo; )---> ", dataToStr);
    var decryptData = utils.Decrypt(dataToStr);
    var mcuid = decryptData.substring(decryptData.length - 8, decryptData.length);
    var togtherTime = decryptData.substring(0, 10);
    console.log("-------设备 返回数据 to app ( $getInfo; )---> 解密--->mcuid：", mcuid);
    console.log("-------设备 返回数据 to app ( $getInfo; )---> 解密--->togtherTime：", togtherTime);

    that.setData({
      mcuid: mcuid,
      togtherTime: togtherTime
    });
    //区分开锁关锁
    if (cb == "lock") {
      that.lockData(togtherTime);
    }
    if (cb == "unlock") {
      that.unlockData(togtherTime);
    }
  },

  unlockData: function (togtherTime) {
    var that = this;
    //加密：开锁数据
    let encryptData = utils.Encrypt(togtherTime + "unlock");
    that.writeDataToDevice("24" + encryptData + "3b");
    // that.setData({
    //   lockState: true,
    //   lockData: "关锁"
    // });
  },

  lockData: function (togtherTime) {
    var that = this;
    let encryptData = utils.Encrypt(togtherTime + "lock");
    that.writeDataToDevice("24" + encryptData + "3b");
  },

  developCahara: function () {
    var that = this;
    setTimeout(function () {

      wx.onBLECharacteristicValueChange(function (characteristic) {
        let charaId = characteristic.characteristicId
        var arrayBuffer = characteristic.value
        console.log("设备 send data to 小程序 ---> " +  " 字节长度  = ", arrayBuffer.byteLength);
        if (that.data.mcuid != "" && that.data.togtherTime != "") {
          var dataView = new DataView(arrayBuffer)
          //处理返回数据
          //解密
          var dataToStr = ""
          for (let i = 1; i < dataView.byteLength - 1; i++) {//字节数组转16进制
            var orign = dataView.getUint8(i).toString(16);//十进制转16进制
            // var int16 = dataView.getInt8(i)
            var data = "0"
            if (orign.length < 2) {
              data += orign
              dataToStr += data
            } else {
              dataToStr += orign
              data += orign
            }
          }
          console.log("设备开锁 & 关锁 返回（解密前）----> ", dataToStr);
          var decryptData = utils.Decrypt(dataToStr);
          var togtherTime = decryptData.substring(0, 10);
          var own = decryptData.substring(10, decryptData.length);
          console.log("设备开锁 & 关锁 （解密后）---- togtherTime", togtherTime);

          if (own == "unlocked"){
              //开锁成功
            console.log("设备开锁成功 （解密后） ---- own", own);
             that.setData({
                 lockState: true,
                 lockData: "关锁"
             });
          } else if (own == "locked"){
            //关锁成功
            console.log("设备关锁成功 （解密后） ---- own", own);
            that.setData({
              lockState: false,
              lockData: "开锁"
            });
          }else{
            console.log("设备返回的数据有误！！！！");
            wx.showLoading({
              title: '设备返回数据有误',
            })
            setTimeout(function(){
              wx.hideLoading();
            },10000);
          }
        } else {
          var  dataView = new DataView(arrayBuffer)
          if (that.data.lockState) {
            that.dealWithMCUID(dataView, "lock");
          } else {
            that.dealWithMCUID(dataView, "unlock");
          }
        }

        // if (!that.data.lockState) { //开锁数据
        //   that.unlockData(dataView);
        // } else {  //关锁
        //   that.lockData(dataView);
        // }

        // var v = that._arrayBufferToBase64(characteristic.value)
        // console.log("接受到设备返回的数据包 = ", that._arrayBufferToBase64(characteristic.value));
        // var destSatr = v.substring(1, v.length - 1);
        // console.log("dataSatr", destSatr);

        // that.setData({
        //   result: v
        // });

        // if (characteristic.characteristicId.indexOf("cd01") != -1) {
        //   const result = characteristic.value;
        //   const hex = that.buf2hex(result);
        //   console.log(hex);
        // }
        // if (characteristic.characteristicId.indexOf("cd04") != -1) {
        //   const result = characteristic.value;
        //   const hex = that.buf2hex(result);
        //   console.log(hex);
        //   that.setData({ result: hex });
        // }

      })
      /**
       * 顺序开发设备特征notifiy
       */
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd01,
        state: true,
        success: function (res) {
          // success
          console.log('cd01--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          // fail
          console.log('cd01--notifyBLECharacteristicValueChanged fail', res);
        },
        complete: function (res) {
          // complete
        }
      })
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd02,
        state: true,
        success: function (res) {
          // success
          console.log('cd02--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          // fail
          console.log('cd02--notifyBLECharacteristicValueChanged fail', res);
        },
        complete: function (res) {
          // complete
        }
      })
      wx.hideLoading()
      wx.notifyBLECharacteristicValueChanged({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.cd03,
        state: true,
        success: function (res) {
          // success
          console.log('cd03--notifyBLECharacteristicValueChanged success', res);
        },
        fail: function (res) {
          // fail
          console.log("cd03--notifyBLECharacteristicValueChanged fail", res);
        },
        complete: function (res) {
          // complete
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
  }
})