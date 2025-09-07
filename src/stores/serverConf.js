/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2024-01-04 09:48:08
 * @Description: 服务器配置
 * @LastEditTime: 2025-03-10 12:45:25
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import { isIdentityAuth } from '@/api/serverConf'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useServerConfStore = defineStore('serverConf', () => {
  const isIdentity = useStorage('isIdentity', false)

  function init() {
    isIdentityAuth()
    .then(response => {
      isIdentity.value = response.data
    })
    .catch(error => {
      console.error('获取服务器是否启用了Identity失败:', error)
    })
  }

  function setIsIdentityAuth(isIdentityAuth) {
    isIdentity.value = isIdentityAuth
  }

  return {
    isIdentity,
    init,
    setIsIdentityAuth
  }
}) 
