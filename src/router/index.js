/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2025-09-23 21:15:38
 * @LastEditTime: 2025-09-23 21:47:19
 * @Description: 
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import { createRouter, createWebHistory } from 'vue-router'
import GanttChart from '../components/GanttChart.vue'
import H5View from '../views/H5View.vue'
import HelpView from '../views/HelpView.vue'
import AboutView from '../views/AboutView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GanttChart
  },
  {
    path: '/h5',
    name: 'H5',
    component: H5View
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpView
  },
  {
    path: '/gantt-chart-online',
    name: 'About',
    component: AboutView,
    meta: {
      title: '在线甘特图 - 星甘StarGantt | 免费甘特图制作工具',
      description: '星甘是免费开源的在线甘特图制作工具，支持项目进度管理、任务分解、基线对比、Excel导出等功能'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 移动端检测函数
const isMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'opera mini'
  ]
  
  // 检查用户代理字符串
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  )
  
  // 检查屏幕宽度
  const isMobileScreen = window.innerWidth <= 768
  
  // 检查触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  return isMobileUserAgent || (isMobileScreen && isTouchDevice)
}

// 路由守卫：移动端自动跳转
router.beforeEach((to, from, next) => {
  // 如果是移动端访问首页，且没有强制桌面版参数，自动跳转到h5页面
  if (to.path === '/' && isMobile() && !to.query.desktop) {
    // 保持原有的查询参数
    next({
      path: '/h5',
      query: to.query
    })
  } else {
    next()
  }
})

export default router 