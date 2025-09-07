/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2022-05-31 22:22:34
 * @LastEditTime: 2025-07-23 17:53:28
 * @Description: 资源请求
 * @
 * @Copyright (c) 2022 by yubaolee | ahfu~ , All Rights Reserved.
 */
import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/resources/load',
    method: 'get',
    params,
  })
}

export function loadForRole(roleId) {
  return request({
    url: '/resources/loadForRole',
    method: 'get',
    params: { appId: '', firstId: roleId },
  })
}

/**
 * 获取资源类型列表
 * @returns 
 */
export function getResourceApps() {
  return request({
    url: '/resources/getResourceApps',
    method: 'get',
  })
}
export function add(data) {
  return request({
    url: '/resources/add',
    method: 'post',
    data,
  })
}

// 同步系统API资源到资源表
export async function sync(data) {
  return await request({
    url: '/resources/sync',
    method: 'post',
    data,
  })
}

export function update(data) {
  return request({
    url: '/resources/update',
    method: 'post',
    data,
  })
}

export function del(data) {
  return request({
    url: '/resources/delete',
    method: 'post',
    data,
  })
}

export function loadByIds(data) {
  return request({
    url: '/resources/loadByIds',
    method: 'post',
    data,
  })
}
