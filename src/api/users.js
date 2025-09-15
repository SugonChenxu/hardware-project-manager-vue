/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2025-09-07 14:43:31
 * @LastEditTime: 2025-09-15 22:38:24
 * @Description: 
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/users/load',
    method: 'get',
    params,
  })
}

/**
 * 是否忽略登录用户权限，直接获取全部数据
 * 用于可以跨部门选择用户的场景
 */
export function loadAll(params) {
  return request({
    url: '/users/loadall',
    method: 'get',
    params,
  })
}

export function get(params) {
  return request({
    url: '/users/get',
    method: 'get',
    params,
  })
}

export function getUserVip() {
  return request({
    url: '/users/getuservip',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/users/addorupdate',
    method: 'post',
    data,
  })
}

export function update(data) {
  return request({
    url: '/users/addorupdate',
    method: 'post',
    data,
  })
}

export function changePassword(data) {
  return request({
    url: '/users/changepassword',
    method: 'post',
    data,
  })
}

export function changeProfile(data) {
  return request({
    url: '/users/changeprofile',
    method: 'post',
    data,
  })
}

export function del(data) {
  return request({
    url: '/users/delete',
    method: 'post',
    data,
  })
}

export function loadByIds(data) {
  return request({
    url: '/users/loadByIds',
    method: 'post',
    data,
  })
}

export function loadByRole(params) {
  return request({
    url: '/users/loadByRole',
    method: 'get',
    params,
  })
}
export function LoadByOrg(params) {
  return request({
    url: '/users/LoadByOrg',
    method: 'get',
    params,
  })
}
