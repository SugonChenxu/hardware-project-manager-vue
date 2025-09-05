/**
 * 甘特图数据服务
 * 负责数据的加载、保存和管理
 */

import ganttData from '../data/gantt-data.json'

/**
 * 加载甘特图数据
 * @returns {Promise<{tasks: Array, links: Array}>}
 */
export const loadGanttData = async () => {
  try {
    // 这里可以改为从API加载数据
    // const response = await fetch('/api/gantt-data')
    // const data = await response.json()
    
    // 目前从本地JSON文件加载
    return {
      tasks: ganttData.tasks,
      links: ganttData.links
    }
  } catch (error) {
    console.error('加载甘特图数据失败:', error)
    return {
      tasks: [],
      links: []
    }
  }
}

/**
 * 保存甘特图数据
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 */
export const saveGanttData = async (tasks, links) => {
  try {
    // 这里可以改为保存到API
    // const response = await fetch('/api/gantt-data', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ tasks, links })
    // })
    
    console.log('甘特图数据已保存:', { tasks: tasks.length, links: links.length })
    return true
  } catch (error) {
    console.error('保存甘特图数据失败:', error)
    return false
  }
}

/**
 * 导出甘特图数据为JSON格式
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 * @returns {string} JSON字符串
 */
export const exportToJson = (tasks, links) => {
  const data = {
    tasks,
    links,
    exportTime: new Date().toISOString(),
    version: '1.0'
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 从JSON数据导入
 * @param {string} jsonString - JSON字符串
 * @returns {{tasks: Array, links: Array} | null}
 */
export const importFromJson = (jsonString) => {
  try {
    const data = JSON.parse(jsonString)
    if (data.tasks && Array.isArray(data.tasks)) {
      return {
        tasks: data.tasks,
        links: data.links || []
      }
    }
    throw new Error('无效的JSON格式')
  } catch (error) {
    console.error('导入JSON数据失败:', error)
    return null
  }
}

/**
 * 验证任务数据格式
 * @param {Object} task - 任务对象
 * @returns {boolean}
 */
export const validateTask = (task) => {
  const requiredFields = ['id', 'text', 'start_date', 'duration']
  return requiredFields.every(field => task.hasOwnProperty(field))
}

/**
 * 生成新的任务ID
 * @param {Array} tasks - 现有任务列表
 * @returns {number}
 */
export const generateNewTaskId = (tasks) => {
  if (!tasks || tasks.length === 0) return 1
  return Math.max(...tasks.map(t => t.id)) + 1
}

/**
 * 获取任务统计信息
 * @param {Array} tasks - 任务列表
 * @returns {Object}
 */
export const getTaskStatistics = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      planned: 0,
      completionRate: 0
    }
  }

  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const planned = tasks.filter(t => t.status === 'planned').length

  return {
    total: tasks.length,
    completed,
    inProgress,
    planned,
    completionRate: Math.round((completed / tasks.length) * 100)
  }
}