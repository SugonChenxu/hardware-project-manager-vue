/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2025-09-07 17:38:06
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
      if ( res.code === 50014) { //50014:Token过期了
        ElMessageBox.confirm(
          '登录已超时，可以【取消】继续留在该页面，或者【重新登录】',
          '超时提醒',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
        
        })
      } else {
        ElMessage.error(res.message || res.msg)
      }
      return Promise.reject('error')
    } else {
      return res
    }
  },
  //HttpResponse的状态码不是200时，都会进入erro环节
  async error => {
    // HttpResponse的状态码如果是401 
    if (error.response && error.response.status === 401) {
      // 校验是否有 refresh_token
      if (!getToken()) {
        // 清除token
        removeToken()
        setTimeout(() => {
          ElMessage.closeAll()
          ElMessage.error(error.response.data.message)
        })
        return Promise.reject(error)
      }
    }
    //ERR_NETWORK等没有HttpResponse的情况
    ElMessage.closeAll()
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)
export default service
