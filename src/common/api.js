const buildPromiseCommon = (asyncFunc, syncFunc, args) => {
  return new Promise((resolve, reject) => {
    if (pdown) {
      if (pdown[asyncFunc]) {
        pdown[asyncFunc](...args, response => resolve(response), error => reject(error))
      } else if (pdown[syncFunc]) {
        try {
          resolve(pdown[syncFunc](...args))
        } catch (error) {
          reject(error)
        }
      }
    }
  })
}

export default {
  /**
   * 根据下载请求解析响应相关内容
   * @param {Object} request 下载请求
   */
  resolve(request) {
    return buildPromiseCommon('resolveAsync', 'resolve', [request])
  },

  /**
   * 创建一个任务，会唤醒Proxyee Down并弹出下载框
   * @param {Object} request 下载请求
   * @param {Object} response 下载响应
   */
  createTask(request, response) {
    return buildPromiseCommon('createTaskAsync', 'createTask', [request, response])
  },

  /**
   * 创建一个任务，不弹下载框直接在后台下载
   * @param {Object} taskForm 下载任务请求
   */
  pushTask(taskForm) {
    return buildPromiseCommon('pushTask', '', [taskForm])
  },

  /**
   * 取下载相关配置信息
   */
  getDownConfig() {
    return buildPromiseCommon('getDownConfigAsync', 'getDownConfig', [])
  },

  /**
   * 取目标网站的cookie，支持HttpOnly cookie，需要经过代理服务器才能生效
   * @param {string} taskForm 要获取的网站url
   */
  getCookie(url) {
    return buildPromiseCommon('getCookieAsync', 'getCookie', [url || ''])
  }
}
