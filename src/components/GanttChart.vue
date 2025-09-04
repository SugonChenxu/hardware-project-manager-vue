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
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="gantt-container">
      <div ref="ganttContainer" class="gantt-chart"></div>
    </div>

    <!-- 新建任务对话框 -->
    <el-dialog v-model="showTaskDialog" title="新建任务" width="600px">
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
  Calendar, Plus, Expand, Fold, FullScreen, Download
} from '@element-plus/icons-vue'

// 响应式数据
const ganttContainer = ref()
const viewMode = ref('week')
const showTaskDialog = ref(false)

// 任务数据
const tasks = ref([
  {
    id: 1,
    text: "项目启动阶段",
    start_date: "2024-01-01",
    duration: 7,
    progress: 0.8,
    type: "project",
    parent: 0
  },
  {
    id: 2,
    text: "需求分析",
    start_date: "2024-01-01",
    duration: 3,
    progress: 1,
    type: "task",
    parent: 1
  },
  {
    id: 3,
    text: "技术方案设计",
    start_date: "2024-01-04",
    duration: 4,
    progress: 0.6,
    type: "task",
    parent: 1
  },
  {
    id: 4,
    text: "开发阶段",
    start_date: "2024-01-08",
    duration: 20,
    progress: 0.3,
    type: "project",
    parent: 0
  },
  {
    id: 5,
    text: "前端开发",
    start_date: "2024-01-08",
    duration: 15,
    progress: 0.4,
    type: "task",
    parent: 4
  },
  {
    id: 6,
    text: "后端开发",
    start_date: "2024-01-10",
    duration: 18,
    progress: 0.2,
    type: "task",
    parent: 4
  },
  {
    id: 7,
    text: "测试阶段",
    start_date: "2024-01-28",
    duration: 10,
    progress: 0,
    type: "project",
    parent: 0
  },
  {
    id: 8,
    text: "功能测试",
    start_date: "2024-01-28",
    duration: 6,
    progress: 0,
    type: "task",
    parent: 7
  },
  {
    id: 9,
    text: "性能测试",
    start_date: "2024-01-30",
    duration: 5,
    progress: 0,
    type: "task",
    parent: 7
  },
  {
    id: 10,
    text: "项目验收",
    start_date: "2024-02-07",
    duration: 1,
    progress: 0,
    type: "milestone",
    parent: 0
  }
])

// 依赖关系数据
const links = ref([
  { id: 1, source: 2, target: 3, type: "0" },
  { id: 2, source: 1, target: 4, type: "0" },
  { id: 3, source: 4, target: 7, type: "0" },
  { id: 4, source: 5, target: 6, type: "0" },
  { id: 5, source: 7, target: 10, type: "0" }
])

// 新建任务表单数据
const newTask = ref({
  text: '',
  start_date: new Date(),
  duration: 3,
  progress: 0,
  type: 'task',
  parent: 0
})

// 生命周期钩子
onMounted(() => {
  initGantt()
})

onUnmounted(() => {
  if (gantt && gantt.destructor) {
    gantt.destructor()
  }
})

// 初始化甘特图
const initGantt = () => {
  nextTick(() => {
    // 基础配置
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.autosize = true
    gantt.config.row_height = 40
    gantt.config.task_height = 28
    gantt.config.grid_width = 350
    gantt.config.grid_resize = true
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.drag_progress = true
    gantt.config.sort = true
    
    // 时间刻度配置
    setTimeScale(viewMode.value)
    
    // 列配置
    gantt.config.columns = [
      {
        name: "text",
        label: "任务名称",
        width: 180,
        tree: true
      },
      {
        name: "start_date",
        label: "开始时间",
        width: 80,
        align: "center"
      },
      {
        name: "duration",
        label: "工期",
        width: 50,
        align: "center"
      },
      {
        name: "progress",
        label: "进度",
        width: 60,
        align: "center",
        template: function(task) {
          return Math.round(task.progress * 100) + "%"
        }
      }
    ]
    
    // 任务类型配置
    gantt.config.types = {
      'task': 'task',
      'project': 'project', 
      'milestone': 'milestone'
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
    parent: 0
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
    parent: newTask.value.parent
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
  const data = {
    tasks: tasks.value,
    links: links.value,
    exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gantt-data-${dayjs().format('YYYY-MM-DD')}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('数据导出成功')
}

// 工具函数
const getNextId = () => {
  return Math.max(...tasks.value.map(t => t.id)) + 1
}

const updateTaskInArray = (task) => {
  const index = tasks.value.findIndex(t => t.id == task.id)
  if (index !== -1) {
    tasks.value[index] = { ...task }
  }
}

const addTaskToArray = (task) => {
  tasks.value.push({ ...task })
}

const removeTaskFromArray = (id) => {
  const index = tasks.value.findIndex(t => t.id == id)
  if (index !== -1) {
    tasks.value.splice(index, 1)
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
}

.gantt-chart {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
}
</style> 