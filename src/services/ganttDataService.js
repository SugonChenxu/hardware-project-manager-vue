/**
 * 甘特图数据服务（LocalStorage 版）
 * 负责数据的加载、保存和管理
 * 已保留 API 调用结构，后期可切换 Supabase 后端
 */

import defaultData from '../data/gantt-data.json'
import dayjs from 'dayjs'
import { parseTime } from '../utils/index.js'

const STORAGE_KEY = 'hardware-project-manager'
const PROJECT_LIST_KEY = 'hardware-project-list'

/**
 * 获取 LocalStorage 中的数据
 */
const getLocalData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取 LocalStorage 失败:', e)
    return null
  }
}

/**
 * 保存数据到 LocalStorage
 */
const saveLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('写入 LocalStorage 失败:', e)
    return false
  }
}

/**
 * 获取项目列表
 */
const getProjectList = () => {
  try {
    const data = localStorage.getItem(PROJECT_LIST_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

/**
 * 保存项目列表
 */
const saveProjectList = (list) => {
  try {
    localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list))
    return true
  } catch (e) {
    console.error('保存项目列表失败:', e)
    return false
  }
}

/**
 * 加载甘特图数据
 * @param {string} code - 项目代码，如果有则从 LocalStorage 加载，否则加载默认数据
 * @returns {Promise<{tasks: Array, links: Array, projectInfo?: Object}>}
 */
export const loadGanttData = async (code = null) => {
  if (code) {
    // 从 LocalStorage 加载指定项目
    const allData = getLocalData()
    if (allData && allData[code]) {
      const projectData = allData[code]
      return {
        tasks: projectData.tasks || [],
        links: projectData.links || [],
        projectInfo: projectData.projectInfo || null
      }
    }
    // 项目不存在，返回空数据
    return {
      tasks: [],
      links: [],
      projectInfo: { code, name: '新项目', description: '' }
    }
  } else {
    // 没有 Code 直接加载默认数据
    return {
      tasks: defaultData.tasks,
      links: defaultData.links,
      projectInfo: {
        code: `PROJECT_${Date.now()}`,
        name: '未命名项目',
        description: '这是系统自动生成的一个演示项目，你可以在此基础上修改或者直接新建一个项目',
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        customColumns: [],
        visibleColumns: []
      }
    }
  }
}

/**
 * 处理任务数据，确保日期字段正确序列化
 */
const processTasksForSerialization = (tasks) => {
  return tasks.map(task => {
    const processedTask = { ...task }
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
 * 保存甘特图数据
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 * @param {Object} projectInfo - 项目信息
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export const saveGanttDataToProject = async (tasks, links, projectInfo = null) => {
  try {
    const processedTasks = processTasksForSerialization(tasks)
    const ganttDataObj = {
      tasks: processedTasks,
      links,
      customColumns: projectInfo?.customColumns || [],
      visibleColumns: projectInfo?.visibleColumns || [],
      lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    // 读取现有数据
    const allData = getLocalData() || {}
    
    // 生成项目代码
    const projectCode = projectInfo.code || `PROJECT_${Date.now()}`
    
    // 更新数据
    allData[projectCode] = {
      tasks: processedTasks,
      links,
      projectInfo: {
        ...projectInfo,
        code: projectCode,
        lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    }
    
    // 保存到 LocalStorage
    const success = saveLocalData(allData)
    
    if (success) {
      // 同时更新项目列表
      const projectList = getProjectList()
      const existingIndex = projectList.findIndex(p => p.code === projectCode)
      const projectItem = {
        code: projectCode,
        name: projectInfo.name || '未命名项目',
        description: projectInfo.description || '',
        lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        createTime: projectInfo.createTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      
      if (existingIndex >= 0) {
        projectList[existingIndex] = projectItem
      } else {
        projectList.unshift(projectItem)
      }
      
      saveProjectList(projectList)
      
      // 返回项目信息对象（Vue 组件期望 result.data 是项目对象）
      return { 
        success: true, 
        data: {
          code: projectCode,
          name: projectInfo.name || '未命名项目',
          description: projectInfo.description || '',
          lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        } 
      }
    } else {
      throw new Error('保存到 LocalStorage 失败')
    }
  } catch (error) {
    console.error('保存甘特图数据失败:', error)
    throw error
  }
}

/**
 * 加载用户可访问的项目列表
 * @param {Object} params - 查询参数
 * @returns {Promise<{data: Array}>}
 */
export const load = async (params = {}) => {
  try {
    let projectList = getProjectList()
    
    // 支持按名称搜索
    if (params.name) {
      projectList = projectList.filter(p => 
        p.name.includes(params.name) || 
        p.code.includes(params.name)
      )
    }
    
    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      data: projectList.slice(start, end),
      total: projectList.length,
      page,
      pageSize
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    return { data: [], total: 0 }
  }
}

/**
 * 删除项目
 * @param {string} code - 项目代码
 * @returns {Promise<boolean>}
 */
export const deleteProject = async (code) => {
  try {
    const allData = getLocalData() || {}
    delete allData[code]
    saveLocalData(allData)
    
    const projectList = getProjectList()
    const filteredList = projectList.filter(p => p.code !== code)
    saveProjectList(filteredList)
    
    return true
  } catch (error) {
    console.error('删除项目失败:', error)
    return false
  }
}

/**
 * 保存项目历史版本
 * @param {string} code - 项目代码
 * @param {Array} tasks - 任务数据
 * @param {Array} links - 依赖关系数据
 * @param {string} remark - 版本备注
 * @returns {Promise<boolean>}
 */
export const saveProjectHistory = async (code, tasks, links, remark = '') => {
  try {
    const historyKey = `project_history_${code}`
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
    
    history.unshift({
      id: Date.now(),
      tasks,
      links,
      remark,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    
    // 最多保存 20 个历史版本
    if (history.length > 20) {
      history.pop()
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('保存项目历史失败:', error)
    return false
  }
}

/**
 * 加载项目历史版本
 * @param {string} code - 项目代码
 * @returns {Promise<Array>}
 */
export const loadProjectHistory = async (code) => {
  try {
    const historyKey = `project_history_${code}`
    return JSON.parse(localStorage.getItem(historyKey) || '[]')
  } catch (error) {
    console.error('加载项目历史失败:', error)
    return []
  }
}

/**
 * 从 JSON 数据导入
 * @param {string} jsonString - JSON 字符串
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
    throw new Error('无效的 JSON 格式')
  } catch (error) {
    console.error('导入 JSON 数据失败:', error)
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
 * 生成新的任务 ID
 * @param {Array} tasks - 现有任务列表
 * @returns {number}
 */
export const generateNewTaskId = (tasks) => {
  if (!tasks || tasks.length === 0) return 1
  return Math.max(...tasks.map(t => t.id)) + 1
}

/**
 * 递归获取一个任务的所有前置任务 id
 */
export const getAllPredecessors = (taskId, links, visited = new Set()) => {
  if (!links || links.length === 0) return []
  
  if (visited.has(taskId)) {
    console.warn(`检测到循环依赖，任务 ID: ${taskId}`)
    return []
  }
  
  visited.add(taskId)
  
  const directPredecessors = links
    .filter(l => l.target === taskId)
    .map(l => l.source)
  
  const allPredecessors = new Set(directPredecessors)
  
  directPredecessors.forEach(predecessorId => {
    const indirectPredecessors = getAllPredecessors(predecessorId, links, new Set(visited))
    indirectPredecessors.forEach(id => allPredecessors.add(id))
  })
  
  return Array.from(allPredecessors)
}

/**
 * 获取一个任务的直接前置任务 id
 */
export const getDirectPredecessors = (taskId, links) => {
  if (!links || links.length === 0) return []
  return links.filter(l => l.target === taskId).map(l => l.source)
}

/**
 * 递归获取一个任务的所有后序任务 id
 */
export const getAllSuccessors = (taskId, links, visited = new Set()) => {
  if (!links || links.length === 0) return []
  
  if (visited.has(taskId)) {
    console.warn(`检测到循环依赖，任务 ID: ${taskId}`)
    return []
  }
  
  visited.add(taskId)
  
  const directSuccessors = links
    .filter(l => l.source == taskId)
    .map(l => l.target)
  
  const allSuccessors = new Set(directSuccessors)
  
  directSuccessors.forEach(successorId => {
    const indirectSuccessors = getAllSuccessors(successorId, links, new Set(visited))
    indirectSuccessors.forEach(id => allSuccessors.add(id))
  })
  
  return Array.from(allSuccessors)
}

/**
 * 获取一个任务的直接后序任务 id
 */
export const getDirectSuccessors = (taskId, links) => {
  if (!links || links.length === 0) return []
  return links.filter(l => l.source === taskId).map(l => l.target)
}
