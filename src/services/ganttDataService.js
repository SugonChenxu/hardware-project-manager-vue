/**
 * 甘特图数据服务
 * 负责数据的加载、保存和管理
 */

import defaultData from '../data/gantt-data.json'
import * as sysprojectapi from '../api/sysproject.js'
import dayjs from 'dayjs'
import { parseTime } from '../utils/index.js'

/**
 * 加载甘特图数据
 * @param {string} code - 项目代码，如果有则从API加载，否则加载默认数据
 * @returns {Promise<{tasks: Array, links: Array, projectInfo?: Object}>}
 */
export const loadGanttData = async (code = null) => {
    if (code) {
      // 从API加载项目数据
      const response = await sysprojectapi.get({ id: code })

      if (response && response.data) {
        const projectData = response.data

        // 解析项目数据中的甘特图数据
        let tasks = []
        let links = []
        let customColumns = []
        let visibleColumns = []

        if (projectData.content) {
          try {
            const ganttDataObj = typeof projectData.content === 'string'
              ? JSON.parse(projectData.content)
              : projectData.content

            tasks = ganttDataObj.tasks || []
            links = ganttDataObj.links || []
            customColumns = ganttDataObj.customColumns || []
            visibleColumns = ganttDataObj.visibleColumns || []
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
            updateTime: projectData.updateTime,
            createUserName: projectData.createUserName,
            customColumns: customColumns,
            visibleColumns: visibleColumns,
            visibilityScope: projectData.visibilityScope || 0,
            permissionUserIds: projectData.permissionUserIds || [],
            permissionType: projectData.permissionType || 'VIEW',
            viewMode: projectData.viewMode || 'default'
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
          description: '这是系统自动生成的一个演示项目，你可以在此基础上修改或者直接新建一个项目',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          customColumns: [],
          visibleColumns: [] //默认为空，调用方会自动添加默认值
        }
      }
    }
}

/**
 * 处理任务数据，确保日期字段正确序列化
 * @param {Array} tasks - 任务数组
 * @returns {Array} 处理后的任务数组
 */
const processTasksForSerialization = (tasks) => {
  return tasks.map(task => {
    const processedTask = { ...task }

    // 处理日期字段，确保使用本地时区格式
    if (processedTask.start_date) {
      processedTask.start_date = parseTime(processedTask.start_date)
    }
    if (processedTask.end_date) {
      processedTask.end_date = parseTime(processedTask.end_date)
    }
    if (processedTask.planned_start) {
      processedTask.planned_start = parseTime(processedTask.planned_start)
    }
    if (processedTask.planned_end) {
      processedTask.planned_end = parseTime(processedTask.planned_end)
    }

    return processedTask
  })
}

/**
 * 保存甘特图数据到项目
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 * @param {Object} projectInfo - 项目信息（包含customColumns）
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export const saveGanttDataToProject = async (tasks, links, projectInfo = null) => {
  try {
    // 处理任务数据，确保日期正确序列化
    const processedTasks = processTasksForSerialization(tasks)

    const ganttDataObj = {
      tasks: processedTasks,
      links,
      customColumns: projectInfo?.customColumns || [],
      visibleColumns: projectInfo?.visibleColumns || [],
      lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    let projectData = {
      content: JSON.stringify(ganttDataObj),
      name: projectInfo.name,
      description: projectInfo.description,
      code: projectInfo.code,
      visibilityScope: projectInfo.visibilityScope || 0,
      permissionUserIds: projectInfo.permissionUserIds || [],
      permissionType: projectInfo.permissionType || 'VIEW',
      viewMode: projectInfo.viewMode || 'default'
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
 * 递归获取一个任务的所有前置任务id（包括前置任务的前置任务）
 * @param {string|number} taskId - 任务ID
 * @param {Array} links - 现有依赖关系列表
 * @param {Set} visited - 已访问的任务ID集合，用于防止循环依赖
 * @returns {Array} 所有前置任务ID的数组
 */
export const getAllPredecessors = (taskId, links, visited = new Set()) => {
  if (!links || links.length === 0) return []

  // 防止循环依赖
  if (visited.has(taskId)) {
    console.warn(`检测到循环依赖，任务ID: ${taskId}`)
    return []
  }

  visited.add(taskId)

  // 获取直接前置任务
  const directPredecessors = links
    .filter(l => l.target === taskId)
    .map(l => l.source)

  // 递归获取所有前置任务
  const allPredecessors = new Set(directPredecessors)

  directPredecessors.forEach(predecessorId => {
    const indirectPredecessors = getAllPredecessors(predecessorId, links, new Set(visited))
    indirectPredecessors.forEach(id => allPredecessors.add(id))
  })

  return Array.from(allPredecessors)
}

/**
 * 获取一个任务的直接前置任务id（保持向后兼容）
 * @param {string|number} taskId - 任务ID
 * @param {Array} links - 现有依赖关系列表
 * @returns {Array} 直接前置任务ID的数组
 */
export const getDirectPredecessors = (taskId, links) => {
  if (!links || links.length === 0) return []
  return links.filter(l => l.target === taskId).map(l => l.source)
}

/**
 * 递归获取一个任务的所有后序任务id（包括后序任务的后序任务）
 * @param {string|number} taskId - 任务ID
 * @param {Array} links - 现有依赖关系列表
 * @param {Set} visited - 已访问的任务ID集合，用于防止循环依赖
 * @returns {Array} 所有后序任务ID的数组
 */
export const getAllSuccessors = (taskId, links, visited = new Set()) => {
  if (!links || links.length === 0) return []

  // 防止循环依赖
  if (visited.has(taskId)) {
    console.warn(`检测到循环依赖，任务ID: ${taskId}`)
    return []
  }

  visited.add(taskId)

  // 获取直接后序任务
  const directSuccessors = links
    .filter(l => l.source == taskId)
    .map(l => l.target)

  // 递归获取所有后序任务
  const allSuccessors = new Set(directSuccessors)

  directSuccessors.forEach(successorId => {
    const indirectSuccessors = getAllSuccessors(successorId, links, new Set(visited))
    indirectSuccessors.forEach(id => allSuccessors.add(id))
  })

  return Array.from(allSuccessors)
}

/**
 * 获取一个任务的直接后序任务id
 * @param {string|number} taskId - 任务ID
 * @param {Array} links - 现有依赖关系列表
 * @returns {Array} 直接后序任务ID的数组
 */
export const getDirectSuccessors = (taskId, links) => {
  if (!links || links.length === 0) return []
  return links.filter(l => l.source === taskId).map(l => l.target)
}



