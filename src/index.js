import util from './common/util.js'
import api from 'proxyee-down-extension-sdk'

//监听百度云前端页面加载完成
util.onBdyInit(async () => {
  //加载pd下载按钮
  const btnsDiv = util.isShare()
    ? $('.g-button[title^=下载]:first').parent('div')
    : $('.g-button[title=离线下载]').parent('div')
  btnsDiv.append(require('./views/DownButton.js').default)
  //初始化Tip组件
  require('./views/Tip.js')
  //初始化Block组件
  require('./views/Block.js')
  //初始化验证码组件
  require('./views/Vcode.js')
  //初始化cookie
  const cookie = await api.getCookie()

  //解析选择的文件下载地址并处理异常响应
  const downHandle = async (type, downFiles, handle) => {
    const needBuildCookie = util.isShare() && !util.isLogin()
    if (needBuildCookie) {
      //随机分配一个BDUSS
      const bduss =
        '3c2cFgzWENGUWgxU2FBd2N1bDQ0ekZnd09KVVlaRTlSOUZiWjhqMzBvdG9adTViQVFBQUFBJCQAAAAAAAAAAAEAAABMcNglt9e318Lks7~Jq8DvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGjZxlto2cZbd'
      document.cookie = `BDUSS=${bduss};domain=pan.baidu.com;path=/;max-age=600`
    }
    let result = await util.resolveDownLink(type, downFiles)
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
    //清除cookie
    if (needBuildCookie) {
      document.cookie = 'BDUSS=;domain=pan.baidu.com;path=/;max-age=0'
    }
  }

  //构造Proxyee Down下载请求参数
  const buildRequest = (downLink, cookieFlag) => {
    const request = {
      url: downLink
    }
    //如果是下载自己网盘的文件，不带上cookie的去访问直接返回400
    if (!util.isShare() && cookieFlag) {
      request.heads = { Cookie: cookie }
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
    const downFiles = await util.getDownFiles()
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
      const downLink = util.isShare() ? result.list[0].dlink : result.dlink[0].dlink
      const request = buildRequest(downLink, true)
      const response = buildResponse(downFile.server_filename, downFile.size)
      api.createTask({ request, response })
    })
  })

  //压缩链接下载，支持单文件和多文件，有最大文件数量下载限制
  $(document).on('click', 'a[data-menu-id=pd-batch]', async function() {
    $.block()
    const downFiles = await util.getDownFiles()
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
        const taskForm = await api.resolve(buildRequest(downLink))
        api.createTask(taskForm)
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
    const downFiles = await util.getDownFilesDeep()
    if (downFiles.length == 0) {
      $.showError('请选择要下载的文件')
      $.unblock()
      return
    }
    downHandle('dlink', downFiles, async result => {
      //取Proxyee Down下载相关配置信息
      const restConfig = await api.getDownConfig()
      const downLinkArray = util.isShare() ? result.list : result.dlink
      let count = 0
      downLinkArray.forEach(async fileLinkInfo => {
        //根据fs_id匹配对应的文件名和大小
        const fileInfo = downFiles.find(file => file.fs_id == fileLinkInfo.fs_id)
        if (fileInfo) {
          //推送至Proxyee Down下载
          const request = buildRequest(fileLinkInfo.dlink, true)
          const response = buildResponse(fileInfo.server_filename, fileInfo.size)
          //根据百度云文件的路径来设置默认的文件下载路径
          const config = {
            ...{},
            ...restConfig,
            ...{ filePath: restConfig.filePath + fileInfo.path.substring(0, fileInfo.path.lastIndexOf('/')) }
          }
          try {
            await api.pushTask({ request, response, config })
          } catch (error) {}
          $.showInfo(`推送任务成功(${++count}/${downFiles.length})：${fileInfo.server_filename}`)
        }
      })
    })
  })
})
