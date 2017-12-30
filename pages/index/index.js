//index.js
//获取应用实例
var app = getApp()
var utils = require('../../utils/util');
var promiseUtil = require('../../utils/promiseUtil');
var Bluetooth = require('../../utils/util').Bluetooth;
var encStr;
var that;

Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    callback,callback
  );
}

// Promise.prototype.finally = function (callback) {
//   var Promise = this.constructor;
//   return this.then(
//     function (value) {
//       Promise.resolve(callback()).then(
//         function () {
//           return value;
//         }
//       );
//     },
//     function (reason) {
//       Promise.resolve(callback()).then(
//         function () {
//           throw reason;
//         }
//       );
//     }
//   );
// }


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
    var openBluetooth = utils.wxWrap(wx.openBluetoothAdapter);
    //console.log("点击");
    openBluetooth({
      
    }).then(function (res) {
      //获取本机蓝牙适配器状态
      wx.navigateTo({
        url: '../scanble/scanble'
      })
      }, function (res) {
        console.log("失败");
        wx.showModal({
          title: ' 温馨提示',
          content: '请打开蓝牙设置',
          success: function (res) {
            if (res.confirm) {
            }
          }
        })
      }).then().catch(function(){
        
      })
  },

  onLoad: function () {

    var Charts = require('../../utils/wxcharts.js');
    new Charts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: ['2012', '2013', '2014', '2015', '2016', '2017', "2018", "2019", "2020", '2012', '2013', '2014', '2015', '2016', '2017', "2018", "2019", "2020"],
      extra: {
        lineStyle: 'curve'
      },
      enableScroll:true,
      series: [{
        name: '成交量1',
        data: [0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 0.5, 0.7, 0.3, 0.15, 0.2, 0.45, 0.37, 0.4, 0.8, 0.5, 0.7, 0.3],
        format: function (val) {
          return val.toFixed(2) + '万';
        }
      }, {
        name: '成交量2',
        data: [0.30, 0.37, 0.65, 0.78, 0.69, 0.94, 0.78, 0.69, 0.94, 0.30, 0.37, 0.65, 0.78, 0.69, 0.94, 0.78, 0.69, 0.94],
        format: function (val) {
          return val.toFixed(2) + '万';
        }
      }],
      yAxis: {
        title: '成交金额 (万元)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: 320,
      height: 400
    });

    that = this;
    
    // console.info("Bluetooth", Bluetooth);
    // that.testPromise();
    // that.testBindApplyCall();
    // that.testMap([0,1,2,3]);
    that.testCurry();
    that.testCurry2();
    // var fun = that.testCloser();
    // console.info("[/testCloser]", fun(100));

    /****************************/
    
    // utils.showWrapLoading({
    //   "title": "连接设备中",
    //   mask: true,
    //   duration: 1000
    // });

    // showModal({
    //   "title":"连接设备中",
    //    mask:true,
    //    duration:2000
    // }).then(function(){
    //   var p = new Promise(function (resolve, reject) {
    //     //做一些异步操作
    //     setTimeout(function () {
    //       console.log('执行完成');
    //       resolve('随便什么数据');
    //     }, 2000);
    //   });
    //   return p;         
    // }).then(function(data){
    //   console.log("three" + data);
    // });

    // that.getNumber()
    //   .then(
    //   function (data) {
    //     console.log('resolved');
    //     console.log(data);
    //     return Promise.resolve(data);
    //   }
    // ).then(function (reason) {
    //   console.log(reason);
    //   return that.getNumber()
    //   //return Promise.reject("数字太大");
    //   }).then(function (reason) {
    //     console.log(reason);
    //     return that.getNumber()
    //   }).catch(function (reason) {
    //     console.log('rejected2');
    //     console.log(reason);
    //   });

    // that.getNumber2(100)
    //   .then(
    //   function (data) {
    //     console.log('resolved');
    //     console.log(data);
    //     return Promise.resolve(data);
    //   }
    // ).then(function (reason) {
    //   console.log(reason);
    //   //return that.getNumber2()
    //   return Promise.reject("session失效");
    //   }).then(function (reason) {
    //     console.log(reason);
    //     return that.getNumber()
    //   }).catch(function (reason) {
    //     console.log('rejected2');
    //     console.log(reason);
    //     //重新请求
    //     that.getNumber().then(function (data) {
    //       console.log('resolved2');
    //       console.log(data);
    //       return Promise.resolve(data);
    //     })
    //   });

    // setTimeout(function(){
    //   wx.showLoading({
    //     title: 'hello',
    //   })
    // },-2000);

    that.testP().catch(function (reason) {
      console.log(reason);
      //重新请求
      //that.testP();
      //return Promise.reject(reason);

      return new Promise(function (resolve, reject) {
        setTimeout(resolve(reason), 4000);
      });


    }).catch(function (reason) {
      console.log(reason + "er");
      //重新请求
      //that.testP();
      //return Promise.reject("catch异常");
    }).finally(function(reason){
      console.log("finally" + reason);
    });
     

    //testFinally
    Promise
      .all([promiseUtil.runAsyncTask("任务1"), promiseUtil.runAsyncTask("任务2",1000), promiseUtil.runAsyncTask("任务3",3000)])
      .then(function (results) {
        console.log(results);
      }).finally(function(){
          console.log("[/Promise.all] finally ");
      });




    // var myData = new Date();
    // var times = myData.getTime();//当前时间的毫秒数
    // console.log("begain", times);
    // var newTime = new Date(times);
    // console.log("newTime", newTime)
    
    // that.testTimeout();
  },

  testOprate:function(){
    return [
      ...state,
      {
        text: action.text,
        completed: false
      }
    ]
  },

  testTimeout:function(){
     var time = 0.01
     //1ms 1000 -08--12--16--20
     //0.1 41--45-49-53
     //10  25--35--45--55
     //100  01--41--21--01
     //0.01 08--12--16--20
    let point = 0 
    let exce= 0
    var timer = setInterval(function(){
      point ++
      console.log(point);
      if(point % 1000 == 0 ){
        //输出时间
        var myData = new Date();
        var times = myData.getTime();//当前时间的毫秒数
        console.log("end", times);
        var newTime = new Date(times);
        console.log("newTime", newTime)
        exce ++
        if(exce == 3){
          clearInterval(timer);
        }
      }
    },time)
  },

  testP:function(){
    return that.getNumber2(100)
      .then(
      function (data) {
        console.log('resolved');
        console.log(data);
        return Promise.resolve(data);
      }
      ).then(function (reason) {
        console.log(reason);
        //return that.getNumber2()
        return Promise.reject("session失效");
      }).then(function (reason) {
        console.log(reason);
        return that.getNumber()
      });
  },

  /*****************************************utils*************************** */
  encrypting: function () { 
    // var time = new Date().getTime();
    // console.log(time);
    // app.globalData.time = time;
    // var dataStr = "0823111444unlock"
    // var dataArray = this.strToHexCharCode(dataStr);
    // console.log("dataArray", dataArray);
    // encStr = utils.Encrypt(dataStr);

    // console.log("加密后的结果为===", encStr.length);
    // console.log(encStr);
    // this.setData({
    //   encryptData: encStr
    // })
    wx.scanCode({
      success: (res) => {
        console.log(res)
      }
    })

  },

  decrypting: function () {
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
  },

  /*****************************************test************************************** */
  testPromise:function(){
    function fetchComList(){
      // return new Promise(function (resolve, reject) {
      //   var time = 0;
      //   time ++
      //   console.error("[/testPromise fetch]",time);
      //   reject("错误");
      //   //resolve(time);
      // })
      var valueArray = [10,20,30]
      var arrayBuffer = new ArrayBuffer(valueArray.length);
      var dataView = new DataView(arrayBuffer)
      for (let i = 0; i < valueArray.length; i++) {
        dataView.setUint8(i, valueArray[i])
      }
      var deviceParams = { "deviceId": "", "serviceId": "", "characteristicId": "", "arrayBuffer": arrayBuffer}
      return new Promise(function (resolve, reject) {
        wx.writeBLECharacteristicValue({
          deviceId: deviceParams.deviceId,
          serviceId: deviceParams.serviceId,
          characteristicId: deviceParams.characteristicId,
          value: deviceParams.arrayBuffer,
          success: resolve,
          fail: reject,
        })
      })
    }
    var promiseRetryInstance = utils.promiseRetry({ times: 2, delay: 2000 });
    promiseRetryInstance(fetchComList).then(function (data) {
      console.log("[/testPromise]",data)
    },function (err) {
      console.error(err);
    });
    //.catch()
  },


  getNumber : function (){
    var p = new Promise(function (resolve, reject) {
      //做一些异步操作
      setTimeout(function () {
        var num = Math.ceil(Math.random() * 10); //生成1-10的随机数
        // if (num <= 5) {
        //   resolve(num);
        // }
        // else {
        //   reject('数字太大了');
        // }
        resolve(num);
      }, 1000);
    });
    return p;            
  },


  getNumber2: function (num) {
    var p = new Promise(function (resolve, reject) {
      //做一些异步操作
      setTimeout(function () {
        //var num = Math.ceil(Math.random() * 10); //生成1-10的随机数
        // if (num <= 5) {
        //   resolve(num);
        // }
        // else {
        //   reject('数字太大了');
        // }
        resolve(num);
      }, 1000);
    });
    return p;
  },


  testBindApplyCall:function(){
    function fn(a, b, c, d) {
      　　console.log(a, b, c, d);
    }
    //call
    fn.call(null, 1, 2, 3);
    //apply
    fn.apply(null, [1, 2, 3]);
    //bind
    var f = fn.bind(null, 1, 2, 3);
    f(4);
  },

  testMap:function(array){
    let destArry = array.map(function(item){
      return item * item;
    });
    console.info("[testMap]", destArry);
  },

  /**
   * 闭包就是能够读取其他函数内部变量的函数。
   * 由于在Javascript语言中，只有函数内部的子函数才能读取局部变量，
            因此可以把闭包简单理解成“定义在一个函数内部的函数”。
            所以，在本质上，闭包就是将函数内部和函数外部连接起来的一座桥梁。
   * 不足:使用不当容易造成内存浪费
   */
  testCloser:function(){
    let number = 100;
    return function add(number){
      return number += 10;
    }
  },

  /**
   * Curry 柯里化
   */
  testCurry:function(){
    var add = function(x){
      return function(y){
        return x + y;
      }
    }
    var firstCal = add(10);
    console.info("[/curry]", firstCal(20));
    var secondCal = add(100);
    console.log("[/curry]", secondCal(100));
  },

  testCurry2:function(){

    //特殊对象 arguments，开发者无需明确指出参数名，就能访问它们
    //callee 属性的初始值就是正被执行的 Function 对象。
      //callee 属性是 arguments 对象的一个成员，它表示对函数对象本身的引用，
          //这有利于匿名函数的递归或者保证函数的封装性，
    function currying(fn) {
      var slice = Array.prototype.slice,
        __args = slice.call(arguments, 1);
      return function () {
        var __inargs = slice.call(arguments);
        return fn.apply(null, __args.concat(__inargs));
      };
    }

    function square(i) {
      return i * i;
    }

    function dubble(i) {
      return i *= 2;
    }

    function map(handeler, list) {
      return list.map(handeler);
    }
    //debugger
    var mapSQ = currying(map, square);
    console.info("[/concat]", [square].concat([1, 2, 3, 4, 5]))
    console.info("[/curry2]", mapSQ([1, 2, 3, 4, 5]));
    console.info("[/curry2]", mapSQ([6, 7, 8, 9, 10]));
    console.info("[/curry2]", mapSQ([10, 20, 30, 40, 50]));
    // ......

    var mapDB = currying(map, dubble);
    mapDB([1, 2, 3, 4, 5]);
    mapDB([6, 7, 8, 9, 10]);
    mapDB([10, 20, 30, 40, 50]);
  }
})
