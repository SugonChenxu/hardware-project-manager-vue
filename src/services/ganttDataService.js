/**
 * 甘特图数据服务
 * 负责数据的加载、保存和管理
 */

import defaultData from '../data/gantt-data.json'
import * as sysprojectapi from '../api/sysproject.js'
import dayjs from 'dayjs'

/**
 * 加载甘特图数据
 * @param {string} code - 项目代码，如果有则从API加载，否则加载默认数据
 * @returns {Promise<{tasks: Array, links: Array, projectInfo?: Object}>}
 */
export const loadGanttData = async (code = null) => {
  try {
    if (code) {
      // 从API加载项目数据
      const response = await sysprojectapi.get({ id:code })
      
      if (response && response.data) {
        const projectData = response.data
        
        // 解析项目数据中的甘特图数据
        let tasks = []
        let links = []
        
        if (projectData.content) {
          try {
            const ganttDataObj = typeof projectData.content === 'string' 
              ? JSON.parse(projectData.content) 
              : projectData.content
            
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
            createTime: projectData.createTime,
            createUserId: projectData.createUserId,
            updateTime: projectData.updateTime
          }
        }
      } 

      return null;
    } else {
      // 没有Code直接从本地JSON文件加载默认数据
      return {
        tasks: defaultData.tasks,
        links: defaultData.links,
        projectInfo: {
          code: `GANTT_${Date.now()}`,
          name: '未命名项目',
          description: '这是系统自动生成的一个演示项目',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    }
  } catch (error) {
    ElMessage.error('加载甘特图数据失败:', error)
    return null;
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
      lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    let projectData = {
      content: JSON.stringify(ganttDataObj),
        name: projectInfo.name,
        description: projectInfo.description,
        code: projectInfo.code
    }

    let response
    
    if (projectInfo.id) {
      projectData.id = projectInfo.id
      response = await sysprojectapi.update(projectData)
    } else {
      // 如果没有项目代码，生成一个
      if (!projectData.code) {
        projectData.code = `GANTT_${Date.now()}`
      }
      if (!projectData.name) {
        projectData.name = '新建甘特图项目'
      }
      response = await sysprojectapi.add(projectData)
    }
    
    return response;
  } catch (error) {
    console.error('保存甘特图数据到项目失败:', error)
    throw error
  }
}

// 加载用户可访问的列表
export const load = async (params) => {
  let res = await sysprojectapi.load(params);
  return res;
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
