// 创建axios实例
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { baseURL } from '@/config'

const service = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : baseURL + '/api',//请求前缀
  timeout: 10000//请求超时时间 
})
//请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log(config)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

//响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const { data, config } = response
    if (data.code == 200) {
      return data
    } else {
      if (data.code == '-1') {
        if (!config.url.includes('/login') && !config.url.includes('/add') && !config.url.includes('/register')) {
          ElMessage.error(data.msg || '登录过期，请重新登录')
          router.push('/login')
          localStorage.removeItem('token')
          //清空用户信息
          localStorage.removeItem('userInfo')
          window.location.href = '/auth/login'
        } else {
          return data
        }
      } else {
        // 其他错误码也返回 data 对象
        return data
      }
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    if (error.response) {
      console.error('响应错误详情:', error.response)
      if (error.response.status === 403) {
        ElMessage.error('权限不足或服务器拒绝访问 (403)')
      } else {
        ElMessage.error(error.response.data?.msg || error.message || '网络请求错误')
      }
    } else if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error(error.message || '网络请求错误')
    }
    return Promise.reject(error)
  }
)

export default service