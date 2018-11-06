//兼容IE9
import 'core-js'

//取页面相关信息并在hash切换时重新加载
let PAGE_INFO

//监听百度云页面和jQuery加载完毕时
const interval = setInterval(async () => {
  if (window.$ && $('.g-button').size() > 0) {
    clearInterval(interval)
    //初始化pdownSdk
    const pdownSdk = require('proxyee-down-extension-sdk').default
    //初始化API
    const api = require('../common/api').default
    //取待下载的文件相关信息
    const getDownFiles = async () => {
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
    }
    //解析选中所有文件及文件夹里的文件直链列表
    const getDownFilesDeep = async () => {
      let downFiles = await getDownFiles()
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
        fileList = fileList.concat(await api.resolvePathDeep(dirList[i].path, document.cookie, yunData))
      }
      return fileList
    }
    //取当前目录下的文件列表相关信息
    const getPageInfo = async () => {
      const path = getPath()
      return {
        path: path,
        vmode: getVmode(),
        fileList: await api.resolvePath(path, document.cookie, yunData)
      }
    }
    //监听到目录变化时读取目录里的文件信息
    window.addEventListener('hashchange', async function() {
      PAGE_INFO = await getPageInfo()
    })
    PAGE_INFO = await getPageInfo()
    //加载pd下载按钮
    const btnsDiv = isShare()
      ? $('.g-button[title^=下载]:first').parent('div')
      : $('.g-button[title=离线下载]').parent('div')
    btnsDiv.append(require('./views/DownButton').default)
    //初始化Tip组件
    require('./views/Tip')
    //初始化Block组件
    require('./views/Block')
    //初始化验证码组件
    require('./views/Vcode')
    //初始化cookie
    const cookie = await pdownSdk.getCookie()
    //初始化BDUSS
    const bduss =
      pdown.settings && pdown.settings.bduss
        ? pdown.settings.bduss
        : 'WwzQzl4V0YySDZaRFlHdjIxY1ZyN1d2REtKVzdWazdHWmVqQk5FWWRhaTl-dGRiQVFBQUFBJCQAAAAAAAAAAAEAAACbViYQ3~HBqLarzvcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL1xsFu9cbBbM'

    //解析选择的文件下载地址并处理异常响应
    const downHandle = async (type, downFiles, handle) => {
      const needBuildCookie = isShare() && !isLogin()
      if (needBuildCookie) {
        document.cookie = `BDUSS=${bduss};domain=pan.baidu.com;path=/;max-age=600`
      }
      try {
        let result = await api.resolveDownLink(type, downFiles, document.cookie, yunData)
        $.unblock()
        //判断链接是否解析成功
        if (result.errno == 0) {
          //解析链接成功，调用成Proxyee Down进行下载
          handle(result)
        } else if (result.errno == -20) {
          //解析失败，需要输入验证码
          handle(await $.vcodeConfirm(type, downFiles))
        } else if (result.errno == 112) {
          $.showError('页面过期，请刷新重试')
        } else if (result.errno == 121) {
          $.showError('获取压缩链接失败，文件数量过多')
        } else {
          $.showError('获取下载链接失败，错误码：' + result.errno)
        }
      } catch (e) {
        console.error(e)
      } finally {
        $.unblock()
        //清除cookie
        if (needBuildCookie) {
          document.cookie = 'BDUSS=;domain=pan.baidu.com;path=/;max-age=0'
        }
      }
    }

    //构造Proxyee Down下载请求参数
    const buildRequest = (downLink, cookieFlag) => {
      let ua =
        pdown.settings && pdown.settings.speUa
          ? pdown.settings.speUa
          : 'netdisk;6.0.0.12;PC;PC-Windows;10.0.16299;WindowsBaiduYunGuanJia'
      const request = {
        url: downLink,
        heads: {}
      }
      if (ua) {
        request.heads['User-Agent'] = ua
      }
      if (cookieFlag) {
        //分享的文件要带上BDUSS
        if (!isShare()) {
          request.heads['Cookie'] = cookie
        } else {
          request.heads['Cookie'] = `${cookie}; BDUSS=${bduss};`
        }
      }
      return request
    }

    //构造Proxyee Down下载响应参数
    const buildResponse = (name, size) => {
      return {
        fileName: name,
        totalSize: size,
        supportRange: true
      }
    }

    //直链下载，只支持单文件
    $(document).on('click', 'a[data-menu-id=pd-direct]', async function() {
      $.block()
      const downFiles = await getDownFiles()
      if (downFiles.length == 0) {
        $.showError('请选择要下载的文件')
        $.unblock()
        return
      }
      if (downFiles.length > 1 || (downFiles.length == 1 && downFiles[0].isdir == 1)) {
        $.showError('直链下载只支持单个文件，请勿选择多个文件或文件夹')
        $.unblock()
        return
      }
      downHandle('dlink', downFiles, result => {
        const downFile = downFiles[0]
        let downLink = isShare() ? result.list[0].dlink : result.dlink[0].dlink
        //downLink = downLink.replace(/d.pcs.baidu.com/g, 'pcs.baidu.com')
        const request = buildRequest(downLink, true)
        const response = buildResponse(downFile.server_filename, downFile.size)
        pdownSdk.createTask({ request, response })
      })
    })

    //压缩链接下载，支持单文件和多文件，有最大文件数量下载限制
    $(document).on('click', 'a[data-menu-id=pd-batch]', async function() {
      $.block()
      const downFiles = await getDownFiles()
      if (downFiles.length == 0) {
        $.showError('请选择要下载的文件')
        $.unblock()
        return
      }
      downHandle('batch', downFiles, async result => {
        const downLink = result.dlink
        /*
        压缩链接下载的文件大小和文件名需要通过Proxyee Down解析API解析出来，百度云的api里没有返回对应信息
        压缩链接不需要传递cookie
        */
        try {
          const taskForm = await pdownSdk.resolve(buildRequest(downLink))
          pdownSdk.createTask(taskForm)
        } catch (error) {
          const response = JSON.parse(error.responseText)
          if (response.code == 4002) {
            $.showError('创建任务失败：文件总大小超过300M或文件夹名称中包含+号，请使用批量推送下载')
          } else {
            $.showError('创建任务失败：' + response.msg)
          }
        }
      })
    })

    //直接推送下载，把选中的文件全部解析成直链，推送到Proxyee Down下载，不弹下载框使用默认下载路径和连接数
    $(document).on('click', 'a[data-menu-id=pd-push]', async function() {
      $.block()
      const downFiles = await getDownFilesDeep()
      if (downFiles.length == 0) {
        $.showError('请选择要下载的文件')
        $.unblock()
        return
      }
      downHandle('dlink', downFiles, async result => {
        //取Proxyee Down下载相关配置信息
        const restConfig = await pdownSdk.getDownConfig()
        const downLinkArray = isShare() ? result.list : result.dlink
        let count = 0
        downLinkArray.forEach(async fileLinkInfo => {
          //根据fs_id匹配对应的文件名和大小
          const fileInfo = downFiles.find(file => file.fs_id == fileLinkInfo.fs_id)
          if (fileInfo) {
            //推送至Proxyee Down下载
            let downLink = fileLinkInfo.dlink
            //downLink = downLink.replace(/d.pcs.baidu.com/g, 'pcs.baidu.com')
            const request = buildRequest(downLink, true)
            const response = buildResponse(fileInfo.server_filename, fileInfo.size)
            //根据百度云文件的路径来设置默认的文件下载路径
            const config = {
              ...{},
              ...restConfig,
              ...{ filePath: restConfig.filePath + fileInfo.path.substring(0, fileInfo.path.lastIndexOf('/')) }
            }
            try {
              await pdownSdk.pushTask({ request, response, config })
            } catch (error) {}
            $.showInfo(`推送任务成功(${++count}/${downFiles.length})：${fileInfo.server_filename}`)
          }
        })
      })
    })
  }
}, 100)

const isShare = () => {
  return !!yunData.SHARE_ID
}

const isLogin = () => {
  return yunData.LOGINSTATUS === 1
}

/**
 * 取当前选中的文件
 */
const getCheckedFiles = () => {
  let checkedFiles = []
  const vmode = getVmode()
  //网盘个人主页
  if (!yunData.SHARE_ID) {
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
