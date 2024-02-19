import axios from 'axios'

// import qs from 'qs'
import Message from 'vue-m-message'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'

const api = axios.create({
  baseURL: (import.meta.env.DEV && import.meta.env.VITE_OPEN_PROXY === 'true') ? '/proxy/' : import.meta.env.VITE_APP_API_BASEURL,
  timeout: 1000 * 60,
  responseType: 'json',
})

api.interceptors.request.use(
  (request) => {
    // 全局拦截请求发送前提交的参数
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()

    // 设置请求头
    if (request.headers) {
      request.headers['Accept-Language'] = settingsStore.lang
      if (userStore.isLogin) {
        request.headers.Authorization = `bearer ${userStore.token}`
      }
    }
    // 是否将 POST 请求参数进行字符串化处理
    if (request.method === 'post') {
      // request.data = qs.stringify(request.data, {
      //   arrayFormat: 'brackets',
      // })
    }
    return request
  },
)

api.interceptors.response.use(
  (response) => {
    /**
     * 全局拦截请求发送后返回的数据，如果数据有报错则在这做全局的错误提示
     * 规约返回数据格式为：
     * {
     *   success:boolean,
     *   data:any,
     *   errorCode:string,
     *   errorMessage:string,
     * }
     */

    const { success, errorCode, message } = response.data

    if (success) {
      return Promise.resolve(response.data)
    }
    else {
      if (errorCode === '401') {
        useUserStore().logout()
      }
      // 错误提示
      Message.error(message, {
        zIndex: 2000,
      })
      return Promise.reject(response.data)
    }
  },
  (error) => {
    let message = error.message
    if (message === 'Network Error') {
      message = '后端网络故障'
    }
    else if (message.includes('timeout')) {
      message = '接口请求超时'
    }
    else if (message.includes('Request failed with status code')) {
      const code = message.substr(message.length - 3)
      message = `接口${message.substr(message.length - 3)}异常`

      // 超时需要重新登录
      if (code === '401') {
        if (useUserStore().isExpired()) {
          message = `登录超时，请重新登录！`
          useUserStore().logout()
        }
      }
    }
    Message.error(message, {
      zIndex: 2000,
    })
    return Promise.reject(error)
  },
)

export default api
