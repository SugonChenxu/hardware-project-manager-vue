/**
 * 项目 API（LocalStorage 版）
 * 所有函数均操作 LocalStorage，不调用后端
 */

const PROJECT_LIST_KEY = 'hardware-project-list'

const getProjectList = () => {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_LIST_KEY) || '[]')
  } catch (e) { return [] }
}

const saveProjectList = (list) => {
  localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list))
}

// 加载项目列表
export function load(params) {
  const list = getProjectList()
  const filtered = params.name
    ? list.filter(p => p.name.includes(params.name) || p.code.includes(params.name))
    : list
  return Promise.resolve({
    data: filtered.slice(0, params.pageSize || 20)
  })
}

// 按 ID 加载项目
export function loadByProjId(params) {
  const list = getProjectList()
  const project = list.find(p => p.code === params.id || p.id === params.id)
  return Promise.resolve({ data: project || null })
}

// 获取单个项目详情（从 LocalStorage 读取任务数据）
export function get(params) {
  const code = params.id
  const allData = JSON.parse(localStorage.getItem('hardware-project-manager') || '{}')
  const projectData = allData[code]
  if (projectData) {
    return Promise.resolve({ data: { ...projectData.projectInfo, content: JSON.stringify(projectData) } })
  }
  return Promise.resolve({ data: null })
}

// 获取项目数量
export function getProjCnt() {
  const list = getProjectList()
  return Promise.resolve({ data: list.length })
}

// 新增项目（实际保存由 ganttDataService 处理，这里是列表注册）
export function add(data) {
  const list = getProjectList()
  const item = {
    code: data.code || `PROJECT_${Date.now()}`,
    name: data.name || '新建项目',
    description: data.description || '',
    createTime: new Date().toISOString(),
    lastUpdateTime: new Date().toISOString()
  }
  list.unshift(item)
  saveProjectList(list)
  return Promise.resolve({ data: item })
}

// 更新项目信息
export function update(data) {
  const list = getProjectList()
  const idx = list.findIndex(p => p.code === data.code)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data, lastUpdateTime: new Date().toISOString() }
    saveProjectList(list)
  }
  return Promise.resolve({ data: list[idx] })
}

// 收藏项目（记录在 localStorage）
export function star(projectid) {
  const stars = JSON.parse(localStorage.getItem('project-stars') || '[]')
  if (!stars.includes(projectid)) stars.push(projectid)
  localStorage.setItem('project-stars', JSON.stringify(stars))
  return Promise.resolve({ data: { success: true } })
}

// 取消收藏
export function unstar(projectid) {
  const stars = JSON.parse(localStorage.getItem('project-stars') || '[]')
  localStorage.setItem('project-stars', JSON.stringify(stars.filter(id => id !== projectid)))
  return Promise.resolve({ data: { success: true } })
}

// 删除项目
export function del(projectid) {
  const list = getProjectList()
  const filtered = list.filter(p => p.code !== projectid)
  saveProjectList(filtered)
  // 同时删除任务数据
  const allData = JSON.parse(localStorage.getItem('hardware-project-manager') || '{}')
  delete allData[projectid]
  localStorage.setItem('hardware-project-manager', JSON.stringify(allData))
  return Promise.resolve({ data: { success: true } })
}

// 复制项目
export function copy(projectid) {
  const allData = JSON.parse(localStorage.getItem('hardware-project-manager') || '{}')
  const list = getProjectList()
  const newCode = `PROJECT_${Date.now()}`
  if (allData[projectid]) {
    allData[newCode] = JSON.parse(JSON.stringify(allData[projectid]))
    allData[newCode].projectInfo.code = newCode
    allData[newCode].projectInfo.name = (allData[newCode].projectInfo.name || '项目') + '（副本）'
    localStorage.setItem('hardware-project-manager', JSON.stringify(allData))
  }
  const srcItem = list.find(p => p.code === projectid)
  if (srcItem) {
    const newItem = { ...srcItem, code: newCode, name: srcItem.name + '（副本）', createTime: new Date().toISOString() }
    list.unshift(newItem)
    saveProjectList(list)
  }
  return Promise.resolve({ code: 200, data: { code: newCode } })
}

// 恢复到指定版本
export function restoreVersion(projectId, versionId) {
  const historyKey = `project_history_${projectId}`
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]')
  const version = history.find(v => v.id === versionId)
  if (version) {
    const allData = JSON.parse(localStorage.getItem('hardware-project-manager') || '{}')
    if (allData[projectId]) {
      allData[projectId].tasks = version.tasks
      allData[projectId].links = version.links
      localStorage.setItem('hardware-project-manager', JSON.stringify(allData))
    }
    return Promise.resolve({ data: { success: true } })
  }
  return Promise.resolve({ data: { success: false } })
}

// AI 生成甘特图任务（保留原逻辑，需要配置 API Key 后可用）
export function textToGantt(data) {
  // 暂时返回 mock 数据，后期接入真实 AI API
  return Promise.resolve({
    data: {
      tasks: [],
      links: [],
      message: 'AI 功能需要配置 API Key 后使用'
    }
  })
}
