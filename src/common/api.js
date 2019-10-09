import { jQuery as $ } from 'proxyee-down-extension-sdk'

/**
 * 百度云API列表
 */
export default {
  /**
   * 通过关键字搜索网盘文件列表
   */
  getSearchFileList: (searchKey, cookie, yunData) => {
    let params = {
      recursion: 1,
      order: 'time',
      desc: 1,
      showempty: 0,
      web: 1,
      page: 1,
      num: 100,
      key: searchKey,
      channel: 'chunlei',
      app_id: 250528,
      bdstoken: yunData.MYBDSTOKEN,
      logid: getLogID(cookie),
      clienttype: 0
    }
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'https://pan.baidu.com/api/search',
        async: true,
        global: false,
        method: 'GET',
        data: params,
        success(response) {
          resolve(0 === response.errno ? response.list : [])
        },
        error(request, status, error) {
          reject(request, status, error)
        }
      })
    })
  },
  /**
   * 解析文件夹下所有的文件和文件夹
   */
  resolvePath(path, cookie, yunData) {
    if (!yunData.SHARE_ID) {
      let params = {
        dir: path,
        bdstoken: yunData.MYBDSTOKEN,
        logid: getLogID(cookie),
        order: 'size',
        desc: 0,
        clienttype: 0,
        showempty: 0,
        web: 1,
        channel: 'chunlei',
        appid: 250528
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url: 'https://pan.baidu.com/api/list',
          async: true,
          global: false,
          method: 'GET',
          data: params,
          success: function(response) {
            resolve(0 === response.errno ? response.list : [])
          },
          error(request, status, error) {
            reject(request, status, error)
          }
        })
      })
    } else {
      if (path == '/') {
        let fileList = []
        if (yunData.FILEINFO.length != 0) {
          fileList = yunData.FILEINFO
        } else {
          fileList = [
            {
              fs_id: yunData.FS_ID,
              isdir: 0,
              server_filename: yunData.FILENAME
            }
          ]
        }
        return new Promise((resolve, reject) => {
          if (fileList.length > 0) {
            resolve(fileList)
          } else {
            reject('fileList is empty')
          }
        })
      } else {
        let params = {
          uk: yunData.SHARE_UK,
          shareid: yunData.SHARE_ID,
          order: 'other',
          desc: 1,
          showempty: 0,
          web: 1,
          dir: path,
          t: Math.random(),
          bdstoken: yunData.MYBDSTOKEN,
          channel: 'chunlei',
          clienttype: 0,
          app_id: 250528,
          logid: getLogID(cookie)
        }
        return new Promise((resolve, reject) => {
          $.ajax({
            url: 'https://pan.baidu.com/share/list',
            method: 'GET',
            async: true,
            global: false,
            data: params,
            success: function(response) {
              resolve(0 === response.errno ? response.list : [])
            },
            error(request, status, error) {
              reject(request, status, error)
            }
          })
        })
      }
    }
  },
  /**
   * 解析文件夹下所有的文件和文件夹，递归遍历
   */
  async resolvePathDeep(path, cookie, yunData) {
    let fileList = []
    let resFileList = await this.resolvePath(path, cookie, yunData)
    if (resFileList && resFileList.length) {
      for (let i = 0; i < resFileList.length; i++) {
        let fileInfo = resFileList[i]
        if (fileInfo.isdir == 1) {
          //是目录的话继续递归遍历
          fileList = fileList.concat(await this.resolvePathDeep(fileInfo.path, cookie, yunData))
        } else {
          //文件的话加入文件列表
          fileList.push(fileInfo)
        }
      }
    }
    return fileList
  },
  /**
   * 根据选择的文件解析出下载链接
   * @param {string} type 链接获取类型：dlink batch
   * @param {Array} downFiles 待下载的文件
   * @param {string} vcodeInput 输入的验证码
   * @param {string} vcodeStr 验证码vcode
   */
  resolveDownLink(type, downFiles, cookie, yunData, vcodeInput, vcodeStr) {
    if (!yunData.SHARE_ID) {
      const params = {
        sign: getSign(yunData),
        timestamp: yunData.timestamp,
        fidlist: getFidList(downFiles),
        type: type,
        channel: 'chunlei',
        web: 1,
        app_id: 250528,
        bdstoken: yunData.MYBDSTOKEN,
        logid: getLogID(cookie),
        clienttype: 0
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url: 'https://pan.baidu.com/api/download',
          async: true,
          global: false,
          method: 'POST',
          data: params,
          success(response) {
            resolve(response)
          },
          error(request, status, error) {
            reject(request, status, error)
          }
        })
      })
    } else {
      const params = {
        encrypt: 0,
        product: 'share',
        uk: yunData.SHARE_UK,
        primaryid: yunData.SHARE_ID,
        fid_list: getFidList(downFiles)
      }
      if (type == 'batch') {
        params.type = type
      }
      if (yunData.SHARE_PUBLIC != 1) {
        let seKey = decodeURIComponent(getCookie(cookie, 'BDCLND'))
        params.extra = `{"sekey":"${seKey}"}`
      }
      //带验证码
      if (vcodeInput && vcodeStr) {
        params.vcode_input = vcodeInput
        params.vcode_str = vcodeStr
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url:
            'https://pan.baidu.com/api/sharedownload?channel=chunlei&clienttype=0&web=1&app_id=250528&sign=' +
            yunData.SIGN +
            '&timestamp=' +
            yunData.timestamp +
            '&bdstoken=' +
            yunData.MYBDSTOKEN +
            '&logid=' +
            getLogID(cookie),
          async: true,
          global: false,
          method: 'POST',
          data: params,
          success(response) {
            resolve(response)
          },
          error(request, status, error) {
            reject(request, status, error)
          }
        })
      })
    }
  },
  /**
   * 取百度云验证码
   */
  getVcode(cookie) {
    const params = {
      prod: 'pan',
      t: Math.random(),
      bdstoken: yunData.MYBDSTOKEN,
      channel: 'chunlei',
      clienttype: 0,
      web: 1,
      app_id: 250528,
      logid: getLogID(cookie)
    }
    return new Promise((resolve, reject) => {
      $.ajax({
        url: 'https://pan.baidu.com/api/getvcode',
        method: 'GET',
        async: true,
        global: false,
        data: params,
        success(response) {
          resolve(response)
        },
        error(request, status, error) {
          reject(request, status, error)
        }
      })
    })
  }
}

const base64Encode = t => {
  let a,
    r,
    e,
    n,
    i,
    s,
    o = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (e = t.length, r = 0, a = ''; e > r; ) {
    if (((n = 255 & t.charCodeAt(r++)), r == e)) {
      a += o.charAt(n >> 2)
      a += o.charAt((3 & n) << 4)
      a += '=='
      break
    }
    if (((i = t.charCodeAt(r++)), r == e)) {
      a += o.charAt(n >> 2)
      a += o.charAt(((3 & n) << 4) | ((240 & i) >> 4))
      a += o.charAt((15 & i) << 2)
      a += '='
      break
    }
    s = t.charCodeAt(r++)
    a += o.charAt(n >> 2)
    a += o.charAt(((3 & n) << 4) | ((240 & i) >> 4))
    a += o.charAt(((15 & i) << 2) | ((192 & s) >> 6))
    a += o.charAt(63 & s)
  }
  return a
}

/**
 * 生成logID
 * @param {*} cookie BAIDUID cookie
 */
const getLogID = cookie => {
  let u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/~！@#￥%……&'
  let d = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g
  let f = String.fromCharCode

  function l(e) {
    if (e.length < 2) {
      let n = e.charCodeAt(0)
      return 128 > n
        ? e
        : 2048 > n
          ? f(192 | (n >>> 6)) + f(128 | (63 & n))
          : f(224 | ((n >>> 12) & 15)) + f(128 | ((n >>> 6) & 63)) + f(128 | (63 & n))
    }
    let n = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320)
    return f(240 | ((n >>> 18) & 7)) + f(128 | ((n >>> 12) & 63)) + f(128 | ((n >>> 6) & 63)) + f(128 | (63 & n))
  }

  function g(e) {
    return (e + '' + Math.random()).replace(d, l)
  }

  function m(e) {
    let n = [0, 2, 1][e.length % 3]
    let t = (e.charCodeAt(0) << 16) | ((e.length > 1 ? e.charCodeAt(1) : 0) << 8) | (e.length > 2 ? e.charCodeAt(2) : 0)
    let o = [
      u.charAt(t >>> 18),
      u.charAt((t >>> 12) & 63),
      n >= 2 ? '=' : u.charAt((t >>> 6) & 63),
      n >= 1 ? '=' : u.charAt(63 & t)
    ]
    return o.join('')
  }

  function h(e) {
    return e.replace(/[\s\S]{1,3}/g, m)
  }

  function p() {
    return h(g(new Date().getTime()))
  }

  function w(e, n) {
    return n
      ? p(String(e))
          .replace(/[+\/]/g, function(e) {
            return '+' == e ? '-' : '_'
          })
          .replace(/=/g, '')
      : p(String(e))
  }
  // return w(getCookie(name))
  return w(getCookie(cookie, 'BAIDUID'))
}

const getSign = yunData => {
  const signFnc = new Function('return ' + yunData.sign2)()
  return base64Encode(signFnc(yunData.sign5, yunData.sign1))
}

const getFidList = list => {
  if (list.length === 0) {
    return null
  }
  return '[' + list.map(e => e.fs_id).join(',') + ']'
}

const getCookie = (cookie, name) => {
  let o, t
  let c = decodeURI
  return cookie.length > 0 && ((o = cookie.indexOf(name + '=')), -1 != o)
    ? ((o = o + name.length + 1),
      (t = cookie.indexOf(';', o)),
      -1 == t && (t = cookie.length),
      c(cookie.substring(o, t)))
    : ''
}
