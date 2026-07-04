/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~
 * @Date: 2025-09-23 21:15:38
 * @LastEditTime: 2025-09-23 21:47:19
 * @Description: 简化路由（只保留甘特图主页）
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import { createRouter, createWebHistory } from 'vue-router'
import GanttChart from '../components/GanttChart.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GanttChart
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 
