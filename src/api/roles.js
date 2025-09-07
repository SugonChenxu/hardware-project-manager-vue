/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2024-01-04 09:48:08
 * @Description: 
 * @LastEditTime: 2025-07-20 23:09:20
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

/*
* 获取当前登录用户可访问的所有角色
* 分页没有作用
*/
export function getList(params) {
  return request({
    url: '/roles/load',
    method: 'get',
    params,
  })
}

/**
 * 是否忽略登录用户权限，直接获取全部数据
 * 用于可以跨部门选择角色的场景
 */
export function loadAll(params) {
  return request({
    url: '/roles/loadall',
    method: 'get',
    params,
  })
}

export function loadByIds(data) {
  return request({
    url: '/roles/loadByIds',
    method: 'post',
    data,
  })
}

export function loadForUser(userId) {
  return request({
    url: '/roles/loadforuser',
    method: 'get',
    params: { userId: userId },
  })
}

export function add(data) {
  return request({
    url: '/roles/add',
    method: 'post',
    data,
  })
}

export function update(data) {
  return request({
    url: '/roles/update',
    method: 'post',
    data,
  })
}

export function del(data) {
  return request({
    url: '/roles/delete',
    method: 'post',
    data,
  })
}
// 添加用户
export function assignRoleUsers(data) {
  return request({
    url: '/AccessObjs/AssignRoleUsers',
    method: 'post',
    data,
  })
}

//分配资源
export function assignRoleResources(data) {
  return request({
    url: '/AccessObjs/AssignRoleResources',
    method: 'post',
    data,
  })
}