/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2022-05-13 07:32:55
 * @LastEditTime: 2025-09-17 16:54:05
 * @Description: 系统配置
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

export function getWebVersion() {
  return request({
    url: '/sysConf/getWebVersion',
    method: 'get',
  })
}

