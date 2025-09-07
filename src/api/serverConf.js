/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2022-05-13 07:32:55
 * @LastEditTime: 2025-05-11 21:28:10
 * @Description: 系统配置
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

export function isIdentityAuth() {
  return request({
    url: '/sysConf/isIdentityAuth',
    method: 'get',
  })
}

export function getDbTableStructureForSelect(params) {
  return request({
    url: '/sysConf/getDbTableStructureForSelect',
    method: 'get',
    params,
  })
}

