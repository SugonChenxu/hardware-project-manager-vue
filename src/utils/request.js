/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2025-09-10 16:05:40
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 */
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // api的base_url
  timeout: 50000,
})

console.log('接口地址:',import.meta.env.VITE_BASE_API);
// 拦截请求
service.interceptors.request.use(
  async config => {
    config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    return config
  },
  error => {
    // console.log(error);
    return Promise.reject(error)
  }
)
// 拦截响应
service.interceptors.response.use(
 //HttpResponse的Status状态码为正常的200时
  response => {
    const res = response.data  //res就是后端返回的自定义Response实例
    if (res.code !== 200) {
      return Promise.reject(res)
    } else {
      return res
    }
  },
  //HttpResponse的状态码不是200时，都会进入erro环节
  async error => {
    // HttpResponse的状态码如果是401 
    if (error.response && error.response.status === 401) {
      // 清除token
      if (getToken()) {
        removeToken()
      }
      // 创建一个包含错误信息的错误对象
      const unauthorizedError = new Error('用户未授权，请重新登录')
      unauthorizedError.status = 401
      unauthorizedError.code = '401'
      return Promise.reject(unauthorizedError)
    }
    //ERR_NETWORK等没有HttpResponse的情况
    return Promise.reject(error)
  }
)
export default service
