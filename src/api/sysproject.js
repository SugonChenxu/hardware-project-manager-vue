/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2024-01-04 09:48:08
 * @Description: 
 * @LastEditTime: 2025-09-07 16:34:39
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

/*
* 获取当前登录用户可访问的所有角色
* 分页没有作用
*/
export function getList(params) {
  return request({
    url: '/sysproject/load',
    method: 'get',
    params,
  })
}

export function get(params) {
  return request({
    url: '/sysproject/get',
    method: 'get',
    params,
  })
}


export function add(data) {
  return request({
    url: '/sysproject/add',
    method: 'post',
    data,
  })
}

export function update(data) {
  return request({
    url: '/sysproject/update',
    method: 'post',
    data,
  })
}

export function del(data) {
  return request({
    url: '/sysproject/delete',
    method: 'post',
    data,
  })
}
