import { jQuery as $ } from 'proxyee-down-extension-sdk'
import MD5 from 'crypto-js/md5'

global.onStart = function(taskForm) {
  const rand = parseInt(Math.random() * 123456789).toString()
  const sign = MD5(taskForm.request.url + '&' + rand + '&pdbdy').toString()
  let result
  $.ajax({
    method: 'post',
    url: 'http://api.pdown.org/private/bdyResolve',
    //url: 'http://127.0.0.1:9494/private/bdyResolve',
    async: false,
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({ url: taskForm.request.url, rand, sign }),
    success(response) {
      result = response
    },
    error(xhr) {
      console.log('error:' + xhr.responseText)
    }
  })
  console.log(JSON.stringify(result))
  if (result && result.length > 0) {
    return {
      request: {
        method: 'GET',
        url: result[0].url,
        heads: {
          'User-Agent': 'netdisk;P2SP;2.1.13.11'
          //'User-Agent': 'netdisk;5.7.3.1;PC;PC-Windows;6.1.7601;WindowsBaiduYunGuanJia'
          //'User-Agent':
          //  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
          //'User-Agent': 'netdisk;P2SP;2.1.5.25'
        }
      }
    }
  }
  return null
}
