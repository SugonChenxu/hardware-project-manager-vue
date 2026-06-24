/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2022-05-13 01:31:17
 * @LastEditTime: 2025-11-29 14:56:56
 * @Description: 从服务端获取的token管理
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import Cookies from 'js-cookie'

const TokenKey = 'X-Token'

//获取token
export function getToken() {
  return Cookies.get(TokenKey)
}

//设置token
export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires: 10 })
}

//删除token
export function removeToken() {
  return Cookies.remove(TokenKey)
}
