<template>
  <div class="gantt-page">
    <!-- 顶部工具栏 -->
    <div class="gantt-toolbar">
      <div class="toolbar-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Calendar /></el-icon>
          星甘-易用的在线项目进度管理平台
        </h1>
        <el-tag type="success" size="large">{{ tasks.length }} 个任务</el-tag>
      </div>
      
      <div class="toolbar-right">
        <!-- 视图切换 -->
        <el-radio-group v-model="viewMode" size="small" @change="changeView">
          <el-radio-button label="day">日视图</el-radio-button>
          <el-radio-button label="week">周视图</el-radio-button>
          <el-radio-button label="month">月视图</el-radio-button>
          <el-radio-button label="quarter">季度视图</el-radio-button>
        </el-radio-group>
        
        <!-- 操作按钮 -->
        <el-button type="primary" @click="addTask">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
        
        <el-button @click="expandAll">
          <el-icon><Expand /></el-icon>
          展开全部
        </el-button>
        
        <el-button @click="collapseAll">
          <el-icon><Fold /></el-icon>
          折叠全部
        </el-button>
        
        <el-button @click="zoomToFit">
          <el-icon><FullScreen /></el-icon>
          适应窗口
        </el-button>
        
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        
        <el-button @click="importData">
          <el-icon><Upload /></el-icon>
          导入数据
        </el-button>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="gantt-container">
      <div ref="ganttContainer" class="gantt-chart"></div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input 
      ref="fileInput" 
      type="file" 
      accept=".xlsx,.xls,.csv,.json" 
      @change="handleFileUpload" 
      style="display: none;"
    />

    <!-- 新建任务对话框 -->
    <el-dialog v-model="showTaskDialog" title="新建任务" width="800px">
      <el-form :model="newTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.text" placeholder="请输入任务名称" />
        </el-form-item>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="newTask.start_date"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工期(天)">
              <el-input-number
                v-model="newTask.duration"
                :min="1"
                :max="365"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="完成进度">
              <el-slider v-model="newTask.progress" :max="1" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型">
              <el-select v-model="newTask.type" style="width: 100%">
                <el-option label="普通任务" value="task" />
                <el-option label="项目组" value="project" />
                <el-option label="里程碑" value="milestone" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="执行状态">
              <el-select v-model="newTask.status" style="width: 100%">
                <el-option label="计划阶段" value="planned" />
                <el-option label="开发已完成" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="暂停" value="on_hold" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input v-model="newTask.owner" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="相关方">
              <el-input v-model="newTask.stakeholder" placeholder="请输入相关方" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父任务">
              <el-select v-model="newTask.parent" placeholder="选择父任务（可选）" style="width: 100%">
                <el-option label="无" :value="0" />
                <el-option
                  v-for="task in tasks"
                  :key="task.id"
                  :label="task.text"
                  :value="task.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="任务描述">
          <el-input
            v-model="newTask.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import dayjs from 'dayjs'
import {
  Calendar, Plus, Expand, Fold, FullScreen, Download, Upload
} from '@element-plus/icons-vue'
import { 
  loadGanttData, 
  saveGanttData, 
  exportToJson, 
  importFromJson, 
  generateNewTaskId,
  getTaskStatistics 
} from '../services/ganttDataService.js'

// 响应式数据
const ganttContainer = ref()
const fileInput = ref()
const viewMode = ref('week')
const showTaskDialog = ref(false)

// 任务数据 - 从数据服务加载
const tasks = ref([])
const links = ref([])
const loading = ref(true)

// 新建任务表单数据
const newTask = ref({
  text: '',
  start_date: new Date(),
  duration: 3,
  progress: 0,
  type: 'task',
  parent: 0,
  status: 'planned',
  owner: '',
  stakeholder: '',
  description: ''
})

// 生命周期钩子
onMounted(async () => {
  await loadInitialData()
  initGantt()
  
  // 监听窗口尺寸变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (gantt && gantt.destructor) {
    gantt.destructor()
  }
})

// 处理窗口尺寸变化
const handleResize = () => {
  if (gantt && ganttContainer.value) {
    setTimeout(() => {
      gantt.setSizes()
      gantt.render()
    }, 100)
  }
}

// 加载初始数据
const loadInitialData = async () => {
  try {
    loading.value = true
    const data = await loadGanttData()
    tasks.value = data.tasks
    links.value = data.links
    
    console.log('甘特图数据加载成功:', {
      tasks: tasks.value.length,
      links: links.value.length
    })
  } catch (error) {
    console.error('加载甘特图数据失败:', error)
    ElMessage.error('数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 初始化甘特图
const initGantt = () => {
  nextTick(() => {
    // 基础配置
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.autosize = false  // 关闭自动调整大小，使用固定高度
    gantt.config.row_height = 40
    gantt.config.task_height = 28
    gantt.config.grid_width = 1100
    gantt.config.grid_resize = true
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.drag_progress = true
    gantt.config.sort = true
    gantt.config.scrollY = "y"     // 启用垂直滚动
    gantt.config.scrollX = "x"     // 启用水平滚动
    
    // 时间刻度配置
    setTimeScale(viewMode.value)
    
    // 列配置
    gantt.config.columns = [
      {
        name: "text",
        label: "任务名称",
        width: 280,
        tree: true
      },
      {
        name: "start_date",
        label: "开始时间",
        width: 110,
        align: "center",
        template: function(task) {
          return gantt.date.date_to_str("%Y-%m-%d")(task.start_date)
        }
      },
      {
        name: "end_date",
        label: "完成时间",
        width: 110,
        align: "center",
        template: function(task) {
          const endDate = gantt.calculateEndDate(task.start_date, task.duration)
          return gantt.date.date_to_str("%Y-%m-%d")(endDate)
        }
      },
      {
        name: "duration",
        label: "工期",
        width: 90,
        align: "center",
        template: function(task) {
          if (task.duration === 0) return "里程碑"
          return task.duration + " 工作日"
        }
      },
      {
        name: "status",
        label: "执行情况",
        width: 100,
        align: "center",
        template: function(task) {
          const statusMap = {
            'completed': '<span style="color: #67c23a;">✅ 已完成</span>',
            'in_progress': '<span style="color: #409eff;">🔄 进行中</span>',
            'planned': '<span style="color: #909399;">📅 计划中</span>',
            'on_hold': '<span style="color: #e6a23c;">⏸️ 暂停</span>',
            'cancelled': '<span style="color: #f56c6c;">❌ 已取消</span>'
          }
          return statusMap[task.status] || '<span style="color: #909399;">未开始</span>'
        }
      },
      {
        name: "progress",
        label: "完成比例",
        width: 90,
        align: "center",
        template: function(task) {
          const percent = Math.round(task.progress * 100)
          let color = '#f56c6c'
          if (percent >= 80) color = '#67c23a'
          else if (percent >= 50) color = '#e6a23c'
          else if (percent >= 20) color = '#409eff'
          
          return `<span style="color: ${color}; font-weight: bold;">${percent}%</span>`
        }
      },
      {
        name: "owner",
        label: "负责人",
        width: 90,
        align: "center",
        template: function(task) {
          return task.owner || '<span style="color: #c0c4cc;">未分配</span>'
        }
      },
      {
        name: "stakeholder",
        label: "相关方",
        width: 100,
        align: "center",
        template: function(task) {
          return task.stakeholder || '<span style="color: #c0c4cc;">-</span>'
        }
      },
      {
        name: "description",
        label: "任务描述",
        width: 220,
        template: function(task) {
          return task.description || '<span style="color: #c0c4cc;">暂无描述</span>'
        }
      }
    ]
    
    // 任务类型配置
    gantt.config.types = {
      'task': 'task',
      'project': 'project', 
      'milestone': 'milestone'
    }
    
    // 层级结构优化
    gantt.config.open_tree_initially = true  // 默认展开树形结构
    gantt.config.auto_scheduling = false     // 关闭自动调度
    gantt.config.auto_scheduling_strict = false
    gantt.config.work_time = true            // 启用工作时间
    gantt.config.correct_work_time = true    // 调整工作时间
    
    // 任务条颜色配置
    gantt.templates.task_class = function(start, end, task) {
      let css = ""
      if (task.type === 'project') {
        css += "gantt_project_task "
      } else if (task.type === 'milestone') {
        css += "gantt_milestone_task "
      } else {
        css += "gantt_regular_task "
      }
      
      // 根据状态添加CSS类
      if (task.status === 'completed') {
        css += "gantt_completed "
      } else if (task.status === 'in_progress') {
        css += "gantt_in_progress "
      } else if (task.status === 'on_hold') {
        css += "gantt_on_hold "
      }
      
      return css
    }
    
    // 网格行样式
    gantt.templates.grid_row_class = function(start, end, task) {
      let css = ""
      if (task.type === 'project') {
        css += "gantt_project_row "
      }
      return css
    }
    
    // 事件监听
    gantt.attachEvent("onTaskClick", (id, e) => {
      const task = gantt.getTask(id)
      ElMessage.info(`点击任务: ${task.text}`)
      return true
    })
    
    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      ElMessage.success(`任务 "${task.text}" 已更新`)
      updateTaskInArray(task)
    })
    
    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
      ElMessage.success(`新增任务: ${task.text}`)
      addTaskToArray(task)
    })
    
    gantt.attachEvent("onAfterTaskDelete", (id, task) => {
      ElMessage.success(`删除任务: ${task.text}`)
      removeTaskFromArray(id)
    })
    
    // 初始化甘特图
    gantt.init(ganttContainer.value)
    
    // 设置甘特图高度以支持滚动
    setTimeout(() => {
      const containerHeight = ganttContainer.value.clientHeight
      gantt.setSizes()
      gantt.render()
    }, 100)
    
    // 加载数据
    loadData()
  })
}

// 设置时间刻度
const setTimeScale = (mode) => {
  switch (mode) {
    case 'day':
      gantt.config.scale_unit = 'day'
      gantt.config.date_scale = '%Y-%m-%d'
      gantt.config.subscales = [
        { unit: 'hour', step: 6, date: '%H:%i' }
      ]
      break
    case 'week':
      gantt.config.scale_unit = 'week'
      gantt.config.date_scale = '第%W周'
      gantt.config.subscales = [
        { unit: 'day', step: 1, date: '%d' }
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.config.date_scale = '%Y年%M'
      gantt.config.subscales = [
        { unit: 'week', step: 1, date: '第%W周' }
      ]
      break
    case 'quarter':
      gantt.config.scale_unit = 'quarter'
      gantt.config.date_scale = '%Y年第%q季度'
      gantt.config.subscales = [
        { unit: 'month', step: 1, date: '%M' }
      ]
      break
  }
}

// 加载数据
const loadData = () => {
  gantt.parse({
    data: tasks.value,
    links: links.value
  })
}

// 切换视图
const changeView = (mode) => {
  setTimeScale(mode)
  gantt.render()
}

// 添加任务
const addTask = () => {
  newTask.value = {
    text: '',
    start_date: new Date(),
    duration: 3,
    progress: 0,
    type: 'task',
    parent: 0,
    status: 'planned',
    owner: '',
    stakeholder: '',
    description: ''
  }
  showTaskDialog.value = true
}

// 创建任务
const createTask = () => {
  if (!newTask.value.text) {
    ElMessage.warning('请输入任务名称')
    return
  }
  
  const task = {
    id: getNextId(),
    text: newTask.value.text,
    start_date: dayjs(newTask.value.start_date).format('YYYY-MM-DD'),
    duration: newTask.value.duration,
    progress: newTask.value.progress,
    type: newTask.value.type,
    parent: newTask.value.parent,
    status: newTask.value.status,
    owner: newTask.value.owner,
    stakeholder: newTask.value.stakeholder,
    description: newTask.value.description
  }
  
  gantt.addTask(task, newTask.value.parent)
  showTaskDialog.value = false
}

// 展开全部
const expandAll = () => {
  gantt.eachTask((task) => {
    gantt.open(task.id)
  })
}

// 折叠全部
const collapseAll = () => {
  gantt.eachTask((task) => {
    gantt.close(task.id)
  })
}

// 适应窗口
const zoomToFit = () => {
  gantt.zoomToFit()
}

// 导出数据
const exportData = () => {
  try {
    const jsonData = exportToJson(tasks.value, links.value)
    
    const blob = new Blob([jsonData], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gantt-data-${dayjs().format('YYYY-MM-DD')}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导入数据
const importData = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const fileType = file.name.split('.').pop().toLowerCase()
  
  if (fileType === 'json') {
    handleJsonFile(file)
  } else if (fileType === 'csv') {
    handleCsvFile(file)
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    ElMessage.warning('Excel文件导入功能开发中，请使用JSON或CSV格式')
  } else {
    ElMessage.error('不支持的文件格式，请使用JSON、CSV或Excel文件')
  }
  
  // 清空文件选择
  event.target.value = ''
}

// 处理JSON文件
const handleJsonFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = importFromJson(e.target.result)
      if (importedData) {
        tasks.value = importedData.tasks
        links.value = importedData.links
        loadData()
        ElMessage.success(`JSON数据导入成功，导入了${importedData.tasks.length}个任务`)
      } else {
        ElMessage.error('JSON文件格式错误或数据无效')
      }
    } catch (error) {
      ElMessage.error('JSON文件解析失败: ' + error.message)
    }
  }
  reader.readAsText(file)
}

// 处理CSV文件
const handleCsvFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const csv = e.target.result
      const lines = csv.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      const newTasks = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const task = {
          id: newTasks.length + 1,
          text: values[0] || '',
          start_date: values[1] || dayjs().format('YYYY-MM-DD'),
          duration: parseInt(values[2]) || 1,
          progress: parseFloat(values[3]) || 0,
          type: values[4] || 'task',
          parent: parseInt(values[5]) || 0,
          status: values[6] || 'planned',
          owner: values[7] || '',
          stakeholder: values[8] || '',
          description: values[9] || ''
        }
        newTasks.push(task)
      }
      
      if (newTasks.length > 0) {
        tasks.value = newTasks
        links.value = [] // 清空依赖关系，需要用户重新设置
        loadData()
        ElMessage.success(`CSV数据导入成功，导入了${newTasks.length}个任务`)
      } else {
        ElMessage.warning('CSV文件中没有有效的任务数据')
      }
    } catch (error) {
      ElMessage.error('CSV文件解析失败: ' + error.message)
    }
  }
  reader.readAsText(file)
}

// 工具函数
const getNextId = () => {
  return generateNewTaskId(tasks.value)
}

const updateTaskInArray = (task) => {
  const index = tasks.value.findIndex(t => t.id == task.id)
  if (index !== -1) {
    tasks.value[index] = { ...task }
    // 自动保存数据
    saveDataToBrowser()
  }
}

const addTaskToArray = (task) => {
  tasks.value.push({ ...task })
  saveDataToBrowser()
}

const removeTaskFromArray = (id) => {
  const index = tasks.value.findIndex(t => t.id == id)
  if (index !== -1) {
    tasks.value.splice(index, 1)
    saveDataToBrowser()
  }
}

// 保存数据到浏览器本地存储（可选功能）
const saveDataToBrowser = async () => {
  try {
    await saveGanttData(tasks.value, links.value)
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}
</script>

<style scoped>
.gantt-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.gantt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  font-size: 24px;
  color: #409eff;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gantt-container {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  height: calc(100vh - 120px); /* 减去顶部工具栏的高度 */
}

.gantt-chart {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: auto; /* 允许滚动 */
}

/* 甘特图滚动优化 */
:deep(.gantt_layout_cell) {
  overflow: auto !important;
}

:deep(.gantt_data_area) {
  overflow-y: auto !important;
  overflow-x: auto !important;
}

:deep(.gantt_task_bg) {
  overflow: visible !important;
}

/* 自定义滚动条样式 */
:deep(.gantt_data_area)::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

:deep(.gantt_data_area)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

:deep(.gantt_data_area)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
}

:deep(.gantt_data_area)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.gantt_data_area)::-webkit-scrollbar-corner {
  background: #f1f1f1;
}

/* 甘特图样式定制 */
:deep(.gantt_grid) {
  border-right: 1px solid #e4e7ed;
}

:deep(.gantt_grid_head_cell) {
  background: #f5f7fa;
  border-bottom: 2px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
}

:deep(.gantt_cell) {
  border-right: 1px solid #e4e7ed;
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 6px;
}

:deep(.gantt_row) {
  min-height: 40px;
}

:deep(.gantt_row:hover) {
  background: #f9f9f9;
}

/* 任务条样式 */
:deep(.gantt_task_line) {
  border-radius: 4px;
}

:deep(.gantt_task_line.gantt_project) {
  background: #67c23a;
  border: 1px solid #5daf34;
}

:deep(.gantt_task_line.gantt_task) {
  background: #409eff;
  border: 1px solid #337ecc;
}

:deep(.gantt_task_line.gantt_milestone) {
  background: #e6a23c;
  border: 1px solid #cf9236;
}

/* 进度条样式 */
:deep(.gantt_task_progress) {
  background: rgba(255, 255, 255, 0.8);
}

/* 甘特图自定义任务样式 */
:deep(.gantt_project_task) {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border: 2px solid #5daf34;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

:deep(.gantt_regular_task) {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border: 2px solid #337ecc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

:deep(.gantt_milestone_task) {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  border: 2px solid #cf9236;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(230, 162, 60, 0.3);
}

:deep(.gantt_completed) {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border-color: #5daf34;
}

:deep(.gantt_in_progress) {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-color: #337ecc;
}

:deep(.gantt_on_hold) {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  border-color: #cf9236;
}

/* 项目行背景 */
:deep(.gantt_project_row) {
  background: rgba(103, 194, 58, 0.05);
  font-weight: 600;
}

:deep(.gantt_project_row:hover) {
  background: rgba(103, 194, 58, 0.1);
}

/* 任务文本增强 */
:deep(.gantt_task_text) {
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 进度条样式 */
:deep(.gantt_task_progress) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 依赖线样式 */
:deep(.gantt_link_arrow) {
  border-color: #409eff;
}

:deep(.gantt_line_wrapper div) {
  background: #409eff;
  border-radius: 1px;
}

/* 时间刻度样式 */
:deep(.gantt_scale_line) {
  border-bottom: 2px solid #e4e7ed;
  background: linear-gradient(to bottom, #fafafa, #f5f7fa);
}

:deep(.gantt_scale_cell) {
  border-right: 1px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
}

/* 网格增强 */
:deep(.gantt_task_bg) {
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 99px,
    rgba(0, 0, 0, 0.02) 100px
  );
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gantt-toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .toolbar-right {
    flex-wrap: wrap;
  }
  
  .gantt-container {
    padding: 10px;
  }
}
</style> 