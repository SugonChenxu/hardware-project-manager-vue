/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2024-01-04 09:48:08
 * @Description: 
 * @LastEditTime: 2026-01-19 21:36:25
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

// AI生成甘特图任务
export function textToGantt(data) {
  return request({
    url: '/deepseek/textToGantt',
    method: 'post',
    data
  })
}