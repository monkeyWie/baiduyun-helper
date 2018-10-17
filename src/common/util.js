const getPath = () => {
  let hash = location.hash
  let regx = /(^|&|\/|\?)path=([^&]*)(&|$)/i
  let result = hash.match(regx)
  return result && result.length > 2 ? decodeURIComponent(result[2]) : '/'
}

const getVmode = () => {
  let hash = location.hash
  let regx = /(^|&|\/|\?)vmode=([^&]*)(&|$)/i
  let result = hash.match(regx)
  return result && result.length > 2 ? result[2] : 'list'
}

const getSearchKey = () => {
  let hash = location.hash
  let regx = /(^|&|\/|\?)key=([^&]*)(&|$)/i
  let result = hash.match(regx)
  return result && result.length > 2 ? decodeURIComponent(result[2]) : null
}

const getDefaultStyle = (obj, attribute) => {
  return obj.currentStyle ? obj.currentStyle[attribute] : document.defaultView.getComputedStyle(obj, false)[attribute]
}

/**
 * 判断是分享页面还是个人页面
 */
const isShare = () => {
  return window.location.href.indexOf('/disk/home') == -1
}

const getCookie = e => {
  let o, t
  let n = document,
    c = decodeURI
  return n.cookie.length > 0 && ((o = n.cookie.indexOf(e + '=')), -1 != o)
    ? ((o = o + e.length + 1),
      (t = n.cookie.indexOf(';', o)),
      -1 == t && (t = n.cookie.length),
      c(n.cookie.substring(o, t)))
    : ''
}

const getLogID = () => {
  let name = 'BAIDUID'
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

  return w(getCookie(name))
}

const getFidList = list => {
  if (list.length === 0) {
    return null
  }
  return '[' + list.map(e => e.fs_id).join(',') + ']'
}

const getSign = () => {
  let signFnc = new Function('return ' + yunData.sign2)()
  return base64Encode(signFnc(yunData.sign5, yunData.sign1))
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
 * 搜索页面文件列表
 */
const getSearchFileList = searchKey => {
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
    logid: getLogID(),
    clienttype: 0
  }
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/search',
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
}

/**
 * 取当前选中的文件
 */
const getCheckedFiles = () => {
  let checkedFiles = []
  const vmode = getVmode()
  //网盘个人主页
  if (!isShare()) {
    if (vmode == 'list') {
      $('span.EOGexf')
        .parent()
        .each(function() {
          if (
            getDefaultStyle(
              $(this)
                .find('>span>span')
                .get(0),
              'display'
            ) != 'none'
          ) {
            let fileName = $(this)
              .find('div.file-name div.text>a')
              .text()
            checkedFiles.push(fileName)
          }
        })
    } else if (vmode == 'grid') {
      $('div.cEefyz').each(function() {
        if (
          getDefaultStyle(
            $(this)
              .find('>span')
              .get(0),
            'display'
          ) != 'none'
        ) {
          let fileName = $(this)
            .find('div.file-name>a')
            .text()
          checkedFiles.push(fileName)
        }
      })
    }
  } else {
    //分享页面
    if (
      PAGE_INFO.path == '/' &&
      (yunData.FILEINFO.length == 0 || (yunData.FILEINFO.length == 1 && yunData.FILEINFO[0].isdir == 0))
    ) {
      checkedFiles = yunData.FILEINFO.length == 0 ? [yunData.FILENAME] : [yunData.FILEINFO[0].server_filename]
    } else {
      let listType = vmode == 'list' ? 'dd' : 'div'
      $(listType + '.JS-item-active').each(function() {
        checkedFiles.push(
          $(this)
            .find('a.filename')
            .text()
        )
      })
    }
  }
  return checkedFiles
}

/**
 * 解析文件夹下所有的文件和文件夹
 */
function resolvePath(path) {
  if (!isShare()) {
    let params = {
      dir: path,
      bdstoken: yunData.MYBDSTOKEN,
      logid: getLogID(),
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
        url: '/api/list',
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
        logid: getLogID()
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url: '/share/list',
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
}

/**
 * 解析文件夹下所有的文件和文件夹，并进行递归执行
 */
async function resolvePathDeep(path, fileList) {
  let resFileList = await resolvePath(path)
  if (resFileList && resFileList.length) {
    for (let i = 0; i < resFileList.length; i++) {
      let fileInfo = resFileList[i]
      if (fileInfo.isdir == 1) {
        //是目录的话继续递归遍历
        await resolvePathDeep(fileInfo.path, fileList)
      } else {
        //文件的话加入文件列表
        fileList.push(fileInfo)
      }
    }
  }
}

/**
 * 取页面相关信息
 */
const getPageInfo = async () => {
  const path = getPath()
  return {
    path: path,
    vmode: getVmode(),
    fileList: await resolvePath(path)
  }
}

//取页面相关信息并在hash切换时重新加载
let PAGE_INFO

window.addEventListener('hashchange', async function() {
  PAGE_INFO = await getPageInfo()
})

export default {
  onBdyInit(callback) {
    const interval = setInterval(async () => {
      if (window.$ && $('.g-button').size() > 0) {
        clearInterval(interval)
        PAGE_INFO = await getPageInfo()
        callback()
      }
    }, 100)
  },

  /**
   * 取待下载的文件相关信息
   */
  async getDownFiles() {
    let checkedFileList = []
    let checkedFiles = getCheckedFiles()
    if (checkedFiles.length == 0) {
      return checkedFileList
    }
    let fileList = []
    const searchKey = getSearchKey()
    if (searchKey) {
      fileList = await getSearchFileList(searchKey)
    } else {
      fileList = PAGE_INFO.fileList
    }
    $.each(checkedFiles, function(i, checked) {
      $.each(fileList, function(j, file) {
        if (file.server_filename == checked) {
          checkedFileList.push(file)
          return false
        }
      })
    })
    return checkedFileList
  },

  /**
   * 解析选中所有文件及文件夹里的文件直链列表
   */
  async getDownFilesDeep() {
    let downFiles = await this.getDownFiles()
    let fileList = []
    let dirList = []
    for (let i = 0; i < downFiles.length; i++) {
      if (downFiles[i].isdir) {
        dirList.push(downFiles[i])
      } else {
        fileList.push(downFiles[i])
      }
    }
    for (let i = 0; i < dirList.length; i++) {
      await resolvePathDeep(dirList[i].path, fileList)
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
  resolveDownLink(type, downFiles, vcodeInput, vcodeStr) {
    if (!isShare()) {
      const params = {
        sign: getSign(),
        timestamp: yunData.timestamp,
        fidlist: getFidList(downFiles),
        type: type,
        channel: 'chunlei',
        web: 1,
        app_id: 250528,
        bdstoken: yunData.MYBDSTOKEN,
        logid: getLogID(),
        clienttype: 0
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url: '/api/download',
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
        let seKey = decodeURIComponent(getCookie('BDCLND'))
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
            '/api/sharedownload?channel=chunlei&clienttype=0&web=1&app_id=250528&sign=' +
            yunData.SIGN +
            '&timestamp=' +
            yunData.timestamp +
            '&bdstoken=' +
            yunData.MYBDSTOKEN +
            '&logid=' +
            getLogID(),
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
  getVcode() {
    const params = {
      prod: 'pan',
      t: Math.random(),
      bdstoken: yunData.MYBDSTOKEN,
      channel: 'chunlei',
      clienttype: 0,
      web: 1,
      app_id: 250528,
      logid: getLogID()
    }
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/api/getvcode',
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
  },

  isShare,

  isLogin() {
    return $('a[node-type=header-login-btn]').length > 1
  }
}
