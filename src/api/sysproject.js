/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2024-01-04 09:48:08
 * @Description: 
 * @LastEditTime: 2025-09-16 17:27:58
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

/*
* 获取当前登录用户可访问的所有角色
* 分页没有作用
*/
export function load(params) {
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

export function getProjCnt() {
  return request({
    url: '/sysproject/getProjCnt',
    method: 'get'
  })
}


export function add(data) {
  return request({
    url: '/sysproject/add',
    method: 'post',
    data,
  })
}

//收藏
export function star(projectid) {
  return request({
    url: '/sysproject/star',
    method: 'post',
    data: {
      projectid,
    },
  })
}

//取消收藏
export function unstar(projectid) {
  return request({
    url: '/sysproject/unstar',
    method: 'post',
    data: {
      projectid,
    },
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
