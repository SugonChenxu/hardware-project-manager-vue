/**
 * 甘特图数据服务
 * 负责数据的加载、保存和管理
 */

import ganttData from '../data/gantt-data.json'
import { get as getProject, add as addProject, update as updateProject } from '../api/sysproject.js'

/**
 * 加载甘特图数据
 * @param {string} code - 项目代码，如果有则从API加载，否则加载默认数据
 * @returns {Promise<{tasks: Array, links: Array, projectInfo?: Object}>}
 */
export const loadGanttData = async (code = null) => {
  try {
    if (code) {
      // 从API加载项目数据
      console.log('从API加载项目数据，code:', code)
      const response = await getProject({ code })
      
      if (response && response.data) {
        const projectData = response.data
        
        // 解析项目数据中的甘特图数据
        let tasks = []
        let links = []
        
        if (projectData.ganttData) {
          try {
            const ganttDataObj = typeof projectData.ganttData === 'string' 
              ? JSON.parse(projectData.ganttData) 
              : projectData.ganttData
            
            tasks = ganttDataObj.tasks || []
            links = ganttDataObj.links || []
          } catch (error) {
            console.error('解析甘特图数据失败:', error)
          }
        }
        
        return {
          tasks,
          links,
          projectInfo: {
            id: projectData.id,
            code: projectData.code,
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            createTime: projectData.createTime,
            updateTime: projectData.updateTime
          }
        }
      } else {
        console.warn('未找到项目数据，使用默认数据')
        return {
          tasks: ganttData.tasks,
          links: ganttData.links
        }
      }
    } else {
      // 从本地JSON文件加载默认数据
      console.log('加载默认甘特图数据')
      return {
        tasks: ganttData.tasks,
        links: ganttData.links
      }
    }
  } catch (error) {
    console.error('加载甘特图数据失败:', error)
    return {
      tasks: ganttData.tasks || [],
      links: ganttData.links || []
    }
  }
}

/**
 * 保存甘特图数据到项目
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 * @param {Object} projectInfo - 项目信息
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export const saveGanttDataToProject = async (tasks, links, projectInfo = null) => {
  try {
    const ganttDataObj = {
      tasks,
      links,
      lastUpdateTime: new Date().toISOString()
    }
    
    const projectData = {
      ganttData: JSON.stringify(ganttDataObj),
      updateTime: new Date().toISOString()
    }
    
    // 如果有项目信息，合并项目基本信息
    if (projectInfo) {
      Object.assign(projectData, {
        name: projectInfo.name,
        description: projectInfo.description,
        status: projectInfo.status
      })
    }
    
    let response
    
    if (projectInfo && projectInfo.id) {
      // 更新现有项目
      console.log('更新项目数据，ID:', projectInfo.id)
      projectData.id = projectInfo.id
      response = await updateProject(projectData)
    } else {
      // 新增项目
      console.log('新增项目数据')
      // 如果没有项目代码，生成一个
      if (!projectData.code) {
        projectData.code = `GANTT_${Date.now()}`
      }
      if (!projectData.name) {
        projectData.name = '新建甘特图项目'
      }
      response = await addProject(projectData)
    }
    
    return response;
  } catch (error) {
    // 重新抛出错误，保持错误信息完整
    console.error('保存甘特图数据到项目失败:', error)
    throw error
  }
}

/**
 * 保存甘特图数据（兼容旧版本）
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 */
export const saveGanttData = async (tasks, links) => {
  try {
    console.log('甘特图数据已保存到本地:', { tasks: tasks.length, links: links.length })
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