/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2025-09-08 23:40:26
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 */
import request from '@/utils/request'
import { getToken } from '@/utils/auth' // 验权

export function login(data) {
  return request({
    url: '/check/login',
    method: 'post',
    data: {
      Account: data.account,
      Password: data.password,
      AppKey: 'openauth',
    },
  })
}


export function getInfo(token) {
  return request({
    url: '/check/getusername',
    method: 'get',
    params: { token },
  })
}

export function getUserProfile() {
  return request({
    url: '/check/getuserprofile',
    method: 'get',
    params: { token: getToken() },
  })
}


// 获取组织机构列表
// @param {boolean} ignoreAuth - 是否忽略权限验证，true时获取所有组织，false时获取当前用户有权限的组织
export function getOrgs(ignoreAuth) {
  if(ignoreAuth != undefined && ignoreAuth == true){
    return request({
      url: '/orgs/loadall',
      method: 'get',
      params: { token: getToken() },
    })
    
  }else{
    return request({
      url: '/check/getorgs',
      method: 'get',
      params: { token: getToken() },
    })

  }

}

export function getSubOrgs(data) {
  return request({
    url: '/check/getSubOrgs',
    method: 'get',
    params: data,
  })
}

export function logout() {
  return request({
    url: '/check/logout',
    method: 'post',
  })
}
