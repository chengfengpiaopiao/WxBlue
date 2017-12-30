module.exports={
  runAsyncTask:runAsyncTask
}

function runAsyncTask(taskName = "默认任务" , delayTime = 2000){
  return new Promise(function(resolve,reject){
    setTimeout(function () {
      resolve(`${taskName} 延迟 ${delayTime}执行`);
    }, delayTime);
  });
}