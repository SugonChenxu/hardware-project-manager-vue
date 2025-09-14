<template>
  <div class="gantt-page">
    <!-- 顶部工具栏 - Outlook风格 -->
    <div class="outlook-toolbar">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="app-logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 3h6v2H8v-2zm0 3h8v2H8v-2z" fill="currentColor" />
          </svg>
          <span class="app-name">星甘</span>
        </div>
        <div class="project-selector">
          <el-dropdown class="project-dropdown" v-model:visible="projectDropdownVisible" :hide-on-click="false"
            trigger="click" @visible-change="handleDropdownVisibleChange">
            <div class="project-info" @click="toggleProjectDropdown">
              <span class="project-title">{{ projectInfo?.name || '未命名项目' }}</span>
              <span class="project-meta">{{ projectInfo?.code || '无' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="project-menu">
                <div class="project-details">
                  <div class="detail-row">
                    <span class="label">名称</span>
                    <div class="editable-field" v-if="!editingField.name" @click="startEdit('name')">
                      <span class="value editable">{{ projectInfo?.name || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <el-input v-else v-model="editingValue" ref="nameInput" size="small" class="inline-edit-input"
                      @keyup.enter="confirmEdit('name')" @keyup.esc="cancelEdit" />
                  </div>
                  <div class="detail-row">
                    <span class="label">编码</span>
                    <div class="editable-field" v-if="!editingField.code" @click="startEdit('code')">
                      <span class="value editable">{{ projectInfo?.code || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <el-input v-else v-model="editingValue" ref="codeInput" size="small" class="inline-edit-input"
                      @keyup.enter="confirmEdit('code')" @blur="confirmEdit('code')" @keyup.esc="cancelEdit" />
                  </div>
                  <div class="detail-row">
                    <span class="label">描述</span>
                    <div class="editable-field" v-if="!editingField.description" @click="startEdit('description')">
                      <span class="value editable">{{ projectInfo?.description || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <div v-else class="textarea-container">
                      <el-input v-model="editingValue" ref="descriptionInput" type="textarea" :rows="2" size="small"
                        class="inline-edit-textarea" @keyup.ctrl.enter="confirmEdit('description')"
                        @blur="confirmEdit('description')" @keyup.esc="cancelEdit" />
                    </div>
                  </div>
                  <div class="detail-row">
                    <span class="label">创建时间</span>
                    <span class="value readonly">{{ projectInfo?.createTime }}</span>
                  </div>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-button 
          class="outlook-btn" 
          :class="{ 'starred': isStarred }"
          @click="toggleStar" 
          :loading="starring"
          v-if="userInfo && projectInfo?.id && projectInfo.createUserId != userInfo.id">
          <el-icon>
            <StarFilled v-if="isStarred" />
            <Star v-else />
          </el-icon>
          <span>{{ isStarred ? '已收藏' : '收藏' }}</span>
        </el-button>
      </div>

      <!-- 中间操作区域 -->
      <div class="action-section">
        <!-- 项目切换选择器 -->
        <div class="project-switch-section" v-if="projectList.length > 0">
          <el-select v-model="currentProjectCode" class="project-selector" placeholder="选择项目" filterable size="default"
            @change="switchProject">
            <template #prefix>
              <el-icon>
                <FolderAdd />
              </el-icon>
            </template>
            <el-option v-for="project in projectList" :key="project.code" :label="project.name" :value="project.code">
              <div class="project-option">
                <span class="project-name">{{ project.name }}</span>
                <span class="project-code">{{ project.code }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <el-button class="outlook-btn primary" @click="createNewProject">
          <el-icon>
            <FolderAdd />
          </el-icon>
          <span>新建</span>
        </el-button>

        <el-button class="outlook-btn" @click="saveProject" :loading="saving">
          <el-icon>
            <Document />
          </el-icon>
          <span>保存</span>
        </el-button>



        <div class="divider"></div>

        <el-button class="outlook-btn primary" @click="addTask">
          <el-icon>
            <Plus />
          </el-icon>
          <span>新建任务</span>
        </el-button>

        <el-dropdown @command="handleMoreCommand">
          <el-button class="outlook-btn dropdown-btn">
            <el-icon>
              <MoreFilled />
            </el-icon>
            <span>更多</span>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="expand">
                <el-icon>
                  <Expand />
                </el-icon>展开全部
              </el-dropdown-item>
              <el-dropdown-item command="collapse">
                <el-icon>
                  <Fold />
                </el-icon>折叠全部
              </el-dropdown-item>
              <el-dropdown-item command="fit">
                <el-icon>
                  <FullScreen />
                </el-icon>适应窗口
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="divider"></div>

        <el-select v-model="viewMode" class="outlook-select" size="default" @change="changeView">
          <template #prefix>
            <el-icon>
              <Calendar />
            </el-icon>
          </template>
          <el-option label="周视图" value="week" />
          <el-option label="月视图" value="month" />
          <el-option label="季度视图" value="quarter" />
        </el-select>

        <el-dropdown class="column-control">
          <el-button class="outlook-btn dropdown-btn">
            <el-icon>
              <Operation />
            </el-icon>
            <span>字段</span>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="column-control-panel">
                <div class="panel-actions">
                  <el-button size="small" type="text" @click="toggleAllColumns" :disabled="columnOptions.length === 0">
                    {{ isAllSelected ? '全不选' : '全选' }}
                  </el-button>
                </div>
                <el-checkbox-group v-model="visibleColumns" class="column-checkboxes">
                  <el-checkbox v-for="column in columnOptions" :key="column.name" :label="column.name">
                    {{ column.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="divider"></div>

        <el-button class="outlook-btn" @click="exportData">
          <el-icon>
            <Download />
          </el-icon>
          <span>导出</span>
        </el-button>

        <!-- <el-button class="outlook-btn" @click="importData">
          <el-icon>
            <Upload />
          </el-icon>
          <span>导入</span>
        </el-button> -->
      </div>

      <!-- 右侧用户区域 -->
      <div class="user-section">
        <el-dropdown @command="handleUserCommand" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="28" :src="userInfo?.avatar" class="user-avatar">
              <el-icon>
                <User />
              </el-icon>
            </el-avatar>
            <span class="user-name">{{ userInfo?.name || '游客' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item divided command="profile">个人设置</el-dropdown-item>
              <el-dropdown-item command="logout" v-if="userInfo">退出登录</el-dropdown-item>
              <el-dropdown-item command="login" v-else>立即登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="gantt-container">
      <div ref="ganttContainer" class="gantt-chart"></div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv,.json" @change="handleFileUpload"
      style="display: none;" />

    <!-- 新建任务对话框 -->
    <el-dialog v-model="showTaskDialog" title="新建任务" width="800px">
      <el-form :model="newTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.text" placeholder="请输入任务名称" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker v-model="newTask.start_date" type="date" placeholder="选择开始时间" style="width: 100%"
                @change="calculateDurationForNew" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="完成时间">
              <el-date-picker v-model="newTask.end_date" type="date" placeholder="选择完成时间" style="width: 100%"
                @change="calculateDurationForNew" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工期(天)">
              <el-input-number v-model="newTask.duration" :min="1" :max="365" :step="1" style="width: 100%"
                @change="calculateEndDateForNew" />
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
                <el-option label="未开始" value="not_started" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已暂停" value="on_hold" />
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
                <el-option v-for="task in tasks" :key="task.id" :label="task.text" :value="task.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="前置任务">
          <el-select v-model="newTask.predecessors" multiple placeholder="选择前置任务（可选）" style="width: 100%">
            <el-option v-for="task in availableTasksForPredecessors(newTask.id)" :key="task.id"
              :label="`${task.text} (ID: ${task.id})`" :value="task.id" />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            选择的前置任务必须在此任务开始之前完成
          </div>
        </el-form-item>

        <el-row :gutter="16">
        </el-row>

        <el-form-item label="任务描述">
          <el-input v-model="newTask.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑任务" width="800px">
      <el-form :model="editTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="editTask.text" placeholder="请输入任务名称" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker v-model="editTask.start_date" type="date" placeholder="选择开始时间" style="width: 100%"
                @change="calculateDurationForEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="完成时间">
              <el-date-picker v-model="editTask.end_date" type="date" placeholder="选择完成时间" style="width: 100%"
                @change="calculateDurationForEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工期(天)">
              <el-input-number v-model="editTask.duration" :min="1" :max="365" :step="1" style="width: 100%"
                @change="calculateEndDateForEdit" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="完成进度">
              <el-slider v-model="editTask.progress" :max="1" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型">
              <el-select v-model="editTask.type" style="width: 100%">
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
              <el-select v-model="editTask.status" style="width: 100%">
                <el-option label="未开始" value="not_started" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已暂停" value="on_hold" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-input v-model="editTask.owner" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="相关方">
              <el-input v-model="editTask.stakeholder" placeholder="请输入相关方" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父任务">
              <el-select v-model="editTask.parent" placeholder="选择父任务（可选）" style="width: 100%">
                <el-option label="无" :value="0" />
                <el-option v-for="task in tasks.filter(t => t.id !== editTask.id)" :key="task.id" :label="task.text"
                  :value="task.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="前置任务">
          <el-select v-model="editTask.predecessors" multiple placeholder="选择前置任务（可选）" style="width: 100%">
            <el-option v-for="task in availableTasksForPredecessors(editTask.id)" :key="task.id"
              :label="`${task.text} (ID: ${task.id})`" :value="task.id" />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            选择的前置任务必须在此任务开始之前完成
          </div>
        </el-form-item>

        <el-row :gutter="16">
        </el-row>

        <el-form-item label="任务描述">
          <el-input v-model="editTask.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateTask">更新任务</el-button>
        <el-button type="danger" @click="confirmDeleteTask">删除任务</el-button>
      </template>
    </el-dialog>

    <!-- 登录模态框 -->
    <LoginModal v-model="showLoginModal" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { getUserProfile } from '../api/login.js'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as XLSX from 'xlsx'

// 设置dayjs为中文
dayjs.locale('zh-cn')
import {
  Calendar, Plus, Expand, Fold, FullScreen, Download, Upload, Document,
  ArrowDown, FolderAdd, Operation, MoreFilled, User, Edit, Star, StarFilled
} from '@element-plus/icons-vue'
import {
  loadGanttData,
  saveGanttDataToProject,
  load,
  importFromJson,
  generateNewTaskId
} from '../services/ganttDataService.js'
import { star, unstar } from '../api/sysproject.js'
import LoginModal from './LoginModal.vue'
import { getToken, removeToken } from '../utils/auth.js'

// 中文语言包
const locale = zhCn

// 响应式数据
const ganttContainer = ref()
const fileInput = ref()
const nameInput = ref()
const codeInput = ref()
const descriptionInput = ref()
const viewMode = ref('week')
const showTaskDialog = ref(false)
const showEditDialog = ref(false)  // 编辑对话框显示状态
const showLoginModal = ref(false)  // 登录模态框显示状态
const saving = ref(false) // 保存按钮加载状态

// 任务数据 - 从数据服务加载
const tasks = ref([])
const links = ref([])
const loading = ref(true)

// 项目信息
const projectInfo = ref(null)
const projectList = ref([])
const currentProjectCode = ref('')
const urlParams = ref(null)

// 内联编辑状态
const editingField = ref({
  name: false,
  code: false,
  description: false
})
const editingValue = ref('')
const originalValue = ref('')
const projectDropdownVisible = ref(false) // 项目下拉菜单显示状态

// 用户信息
const userInfo = ref(null)

// 收藏状态
const isStarred = ref(false)
const starring = ref(false) // 收藏操作加载状态

// 可显示的字段
const visibleColumns = ref(['text', 'start_date', 'end_date', 'duration', 'status', 'progress', 'owner', 'stakeholder', 'predecessors', 'description'])
const columnOptions = ref([
  { name: 'text', label: '任务名称' },
  { name: 'start_date', label: '开始时间' },
  { name: 'end_date', label: '完成时间' },
  { name: 'duration', label: '工期' },
  { name: 'status', label: '执行情况' },
  { name: 'progress', label: '完成比例' },
  { name: 'owner', label: '负责人' },
  { name: 'stakeholder', label: '相关方' },
  { name: 'predecessors', label: '前置任务' },
  { name: 'description', label: '任务描述' }
])

// 新建任务表单数据
const newTask = ref({
  text: '',
  start_date: new Date(),
  end_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 默认3天后
  duration: 3,
  progress: 0,
  type: 'task',
  parent: 0,
  status: 'not_started',
  owner: '',
  stakeholder: '',
  description: '',
  predecessors: []  // 前置任务列表
})

// 编辑任务表单数据
const editTask = ref({
  id: null,
  text: '',
  start_date: new Date(),
  end_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 默认3天后
  duration: 3,
  progress: 0,
  type: 'task',
  parent: 0,
  status: 'not_started',
  owner: '',
  stakeholder: '',
  description: '',
  predecessors: []  // 前置任务列表
})

// 生命周期钩子
onMounted(async () => {

  // 获取URL参数
  const params = new URLSearchParams(window.location.search)
  let code = params.get('code')
  urlParams.value = { code }

  let loginres;

  // 如果用户已登录则加载用户登录信息
  if (userInfo.value == null && getToken()) {
    loginres = await loadUserInfo();
  }

  if (code == null && loginres != undefined && loginres && loginres.data.length > 0) {
    code = loginres.data[0].code;
  }

  // 设置当前项目代码
  currentProjectCode.value = code || ''

  await loadInitialData(code)
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

const loadUserInfo = async () => {
  let res = await getUserProfile();
  if (res.code == 200) {
    userInfo.value = res.data;
    let projects = await load({ page: 1, limit: 100 });
    projectList.value = projects.data;
    return projects;
  }
}

// 处理窗口尺寸变化
const handleResize = () => {
  if (gantt && ganttContainer.value) {
    setTimeout(() => {
      gantt.setSizes()
      gantt.render()
    }, 100)
  }
}

// 监听字段显示变化
watch(visibleColumns, () => {
  // 确保甘特图已经初始化
  if (gantt && gantt.config && gantt.render) {
    updateColumnVisibility()
  }
}, { deep: true })

// 加载初始数据
const loadInitialData = async (code = null) => {
  try {
    loading.value = true
    const data = await loadGanttData(code);
    if (data == null) {
      loading.value = false;
      ElMessage.error(`未能找到${code}对应的进度计划`)
      return;
    }
    tasks.value = data.tasks
    links.value = data.links
    projectInfo.value = data.projectInfo
    document.title = `${projectInfo.value.name} - 星甘`
    
    // 检查收藏状态
    checkStarStatus()
  } catch (error) {
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
    gantt.config.xml_date = '%Y-%m-%d'  // 添加XML日期格式
    gantt.config.api_date = '%Y-%m-%d %H:%i:%s'  // 添加API日期格式
    gantt.config.autosize = false  // 关闭自动调整大小，使用固定高度
    gantt.config.row_height = 28
    gantt.config.task_height = 20
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
        width: 100,
        align: "center",
      },
      {
        name: "end_date",
        label: "完成时间",
        width: 100,
        align: "center",
      },
      {
        name: "duration",
        label: "工期",
        width: 90,
        align: "center",
        template: function (task) {
          if (task.duration === 0) return "当天"
          return task.duration + "天"
        }
      },
      {
        name: "status",
        label: "执行情况",
        width: 100,
        align: "center",
        template: function (task) {
          const statusMap = {
            'completed': '<span style="color: #67c23a;">✅ 已完成</span>',
            'in_progress': '<span style="color: #409eff;">🔄 进行中</span>',
            'not_started': '<span style="color: #909399;">📅 未开始</span>',
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
        template: function (task) {
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
        template: function (task) {
          return task.owner || '<span style="color: #c0c4cc;">-</span>'
        }
      },
      {
        name: "stakeholder",
        label: "相关方",
        width: 100,
        align: "center",
        template: function (task) {
          return task.stakeholder || '<span style="color: #c0c4cc;">-</span>'
        }
      },
      {
        name: "predecessors",
        label: "前置任务",
        width: 150,
        align: "center",
        template: function (task) {
          if (task.predecessors && task.predecessors.length > 0) {
            const predecessorNames = task.predecessors.map(predId => {
              const predTask = gantt.getTask(predId)
              return predTask ? predTask.text : `任务${predId}`
            }).join(', ')
            return `<span style="color: #409eff;">${predecessorNames}</span>`
          }
          return '<span style="color: #c0c4cc;">-</span>'
        }
      },
      {
        name: "description",
        label: "任务描述",
        width: 200,
        template: function (task) {
          return task.description || '<span style="color: #c0c4cc;">-</span>'
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
    gantt.config.work_time = false            // 禁用工作时间，如果启用则不能选则周末等
    gantt.config.correct_work_time = false    // 禁用调整工作时间

    // 禁用内置编辑器
    gantt.config.readonly = false            // 保持可编辑状态，但禁用内置编辑器
    gantt.config.drag_links = true          // 启用拖拽创建依赖
    gantt.config.details_on_dblclick = false // 禁用双击打开详情
    // gantt.config.click_drag = {              // 配置点击拖拽行为
    //   ignore: ".gantt_task_line, .gantt_task_link" // 忽略任务条和链接的拖拽
    // }

    // 禁用内置弹窗和编辑器
    gantt.config.lightbox = {
      sections: []  // 清空所有内置编辑器配置
    }

    // 任务条颜色配置
    gantt.templates.task_class = function (start, end, task) {
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
    gantt.templates.grid_row_class = function (start, end, task) {
      let css = ""
      if (task.type === 'project') {
        css += "gantt_project_row "
      }
      return css
    }

    // 事件监听
    gantt.attachEvent("onTaskClick", (id, e) => {
      const task = gantt.getTask(id)
      console.info(`点击任务: ${task.text}`)
      return true
    })

    // 添加双击事件监听
    gantt.attachEvent("onTaskDblClick", (id, e) => {
      const task = gantt.getTask(id)
      openEditDialog(task)
      return false  // 阻止默认行为
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

// 计算本月第几周的函数
const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstWeekday = firstDayOfMonth.getDay() // 0是周日，1是周一...
  const dayOfMonth = date.getDate()

  // 计算本月第几周（从1开始）
  const weekOfMonth = Math.ceil((dayOfMonth + firstWeekday) / 7)
  return weekOfMonth
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
      // 使用自定义模板显示当月第几周
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const weekOfMonth = getWeekOfMonth(date)
        return `${year}年${month}月第${weekOfMonth}周`
      }
      gantt.config.subscales = [
        { unit: 'day', step: 1, date: '%m-%d' }
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      gantt.config.subscales = [
        {
          unit: 'week',
          step: 1,
          template: function (date) {
            const weekOfMonth = getWeekOfMonth(date)
            return `第${weekOfMonth}周`
          }
        }
      ]
      break
    case 'quarter':
      gantt.config.scale_unit = 'quarter'
      // 使用自定义模板显示季度
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${year}年第${quarter}季度`
      }
      gantt.config.subscales = [
        {
          unit: 'month',
          step: 1,
          template: function (date) {
            const month = date.getMonth() + 1
            return `${month}月`
          }
        }
      ]
      break
  }
}

// 加载数据
const loadData = () => {
  // 同步前置任务和链接
  syncPredecessorsWithLinks()

  gantt.parse({
    data: tasks.value,
    links: links.value
  })
}

// 同步前置任务和链接
const syncPredecessorsWithLinks = () => {
  // 清空现有链接，重新根据前置任务生成
  const newLinks = []
  let linkId = 1

  tasks.value.forEach(task => {
    if (task.predecessors && task.predecessors.length > 0) {
      task.predecessors.forEach(predId => {
        // 检查前置任务是否存在
        const predTask = tasks.value.find(t => t.id === predId)
        if (predTask) {
          newLinks.push({
            id: linkId++,
            source: predId,
            target: task.id,
            type: "0"
          })
        }
      })
    }
  })

  // 更新links数组
  links.value = newLinks

  console.log('同步完成:', {
    tasks: tasks.value.length,
    links: links.value.length,
    linksGenerated: newLinks.length
  })
}

// 切换视图
const changeView = (mode) => {
  setTimeScale(mode)
  gantt.render()
}

// 计算工期（基于开始时间和完成时间）- 新建任务
const calculateDurationForNew = () => {
  if (newTask.value.start_date && newTask.value.end_date) {
    const startDate = new Date(newTask.value.start_date)
    const endDate = new Date(newTask.value.end_date)

    if (endDate > startDate) {
      // 计算天数差异（包含小数）
      const timeDiff = endDate.getTime() - startDate.getTime()
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
      newTask.value.duration = Math.max(1, Math.round(daysDiff)) // 保留1位小数，最小0.1天
    } else if (endDate <= startDate) {
      // 如果结束时间不晚于开始时间，设置为最小工期
      newTask.value.duration = 0.1
    }
  }
}

// 计算结束时间（基于开始时间和工期）- 新建任务
const calculateEndDateForNew = () => {
  if (newTask.value.start_date && newTask.value.duration) {
    const startDate = new Date(newTask.value.start_date)
    const endDate = new Date(startDate.getTime() + newTask.value.duration * 24 * 60 * 60 * 1000)
    newTask.value.end_date = endDate
  }
}

// 计算工期（基于开始时间和完成时间）- 编辑任务
const calculateDurationForEdit = () => {
  if (editTask.value.start_date && editTask.value.end_date) {
    const startDate = new Date(editTask.value.start_date)
    const endDate = new Date(editTask.value.end_date)

    if (endDate > startDate) {
      // 计算天数差异（包含小数）
      const timeDiff = endDate.getTime() - startDate.getTime()
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
      editTask.value.duration = Math.max(1, Math.round(daysDiff)) // 保留1位小数，最小0.1天
    } else if (endDate <= startDate) {
      // 如果结束时间不晚于开始时间，设置为最小工期
      editTask.value.duration = 0.1
    }
  }
}

// 计算结束时间（基于开始时间和工期）- 编辑任务
const calculateEndDateForEdit = () => {
  if (editTask.value.start_date && editTask.value.duration) {
    const startDate = new Date(editTask.value.start_date)
    const endDate = new Date(startDate.getTime() + editTask.value.duration * 24 * 60 * 60 * 1000)
    editTask.value.end_date = endDate
  }
}

// 添加任务
const addTask = () => {
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 默认3天后

  newTask.value = {
    text: '',
    start_date: startDate,
    end_date: endDate,
    duration: 3,
    progress: 0,
    type: 'task',
    parent: 0,
    status: 'not_started',
    owner: '',
    stakeholder: '',
    description: '',
    predecessors: []
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
    end_date: dayjs(newTask.value.end_date).format('YYYY-MM-DD'),
    duration: newTask.value.duration,
    progress: newTask.value.progress,
    type: newTask.value.type,
    parent: newTask.value.parent,
    status: newTask.value.status,
    owner: newTask.value.owner,
    stakeholder: newTask.value.stakeholder,
    description: newTask.value.description,
    predecessors: newTask.value.predecessors || []
  }

  gantt.addTask(task, newTask.value.parent)

  // 根据前置任务创建链接
  createLinksFromPredecessors(task.id, task.predecessors)

  showTaskDialog.value = false
}

// 打开编辑任务对话框
const openEditDialog = (task) => {
  // 确保开始日期格式正确
  let startDate
  if (task.start_date) {
    if (typeof task.start_date === 'string') {
      startDate = new Date(task.start_date)
    } else if (task.start_date instanceof Date) {
      startDate = task.start_date
    } else {
      startDate = new Date()
    }
  } else {
    startDate = new Date()
  }

  // 确保结束日期格式正确
  let endDate
  if (task.end_date) {
    if (typeof task.end_date === 'string') {
      endDate = new Date(task.end_date)
    } else if (task.end_date instanceof Date) {
      endDate = task.end_date
    } else {
      // 如果没有结束日期，根据开始日期和工期计算
      const duration = task.duration || 1
      endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)
    }
  } else {
    // 如果没有结束日期，根据开始日期和工期计算
    const duration = task.duration || 1
    endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)
  }

  editTask.value = {
    id: task.id,
    text: task.text || '',
    start_date: startDate,
    end_date: endDate,
    duration: task.duration || 1,
    progress: task.progress || 0,
    type: task.type || 'task',
    parent: task.parent || 0,
    status: task.status || 'not_started',
    owner: task.owner || '',
    stakeholder: task.stakeholder || '',
    description: task.description || '',
    predecessors: task.predecessors || []
  }
  showEditDialog.value = true
}

// 更新任务
const updateTask = () => {
  if (!editTask.value.text) {
    ElMessage.warning('请输入任务名称')
    return
  }

  const updatedTask = {
    id: editTask.value.id,
    text: editTask.value.text,
    start_date: editTask.value.start_date,
    end_date: editTask.value.end_date,
    duration: editTask.value.duration,
    progress: editTask.value.progress,
    type: editTask.value.type,
    parent: editTask.value.parent,
    status: editTask.value.status,
    owner: editTask.value.owner,
    stakeholder: editTask.value.stakeholder,
    description: editTask.value.description,
    predecessors: editTask.value.predecessors || []
  }

  try {

    // 获取原任务的前置任务列表
    const originalTask = gantt.getTask(editTask.value.id)
    const oldPredecessors = originalTask.predecessors || []
    const newPredecessors = updatedTask.predecessors || []

    // 更新甘特图中的任务
    gantt.updateTask(editTask.value.id, updatedTask)

    // 更新前置任务链接
    updateTaskLinks(editTask.value.id, oldPredecessors, newPredecessors)

    // 手动更新tasks数组中的数据
    updateTaskInArray(updatedTask)

    showEditDialog.value = false
    ElMessage.success('任务更新成功')

    // 强制重新渲染甘特图
    setTimeout(() => {
      gantt.render()
    }, 100)
  } catch (error) {
    console.error('更新任务失败:', error)
    ElMessage.error('更新任务失败: ' + error.message)
  }
}

// 确认删除任务
const confirmDeleteTask = () => {
  ElMessageBox.confirm(
    `确定要删除任务"${editTask.value.text}"吗？此操作不可撤销。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    gantt.deleteTask(editTask.value.id)
    showEditDialog.value = false
    ElMessage.success('任务删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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

// 导出Excel数据
const exportData  = () => {
  try {
    // 准备Excel数据
    const excelData = []
    
    // 添加表头
    const headers = [
      '任务ID',
      '任务名称', 
      '开始时间',
      '完成时间',
      '工期(天)',
      '完成进度(%)',
      '任务类型',
      '执行状态',
      '负责人',
      '相关方',
      '父任务',
      '前置任务',
      '任务描述'
    ]
    excelData.push(headers)
    
    // 添加任务数据
    tasks.value.forEach(task => {
      // 获取父任务名称
      const parentTask = task.parent ? tasks.value.find(t => t.id === task.parent) : null
      const parentTaskName = parentTask ? parentTask.text : '无'
      
      // 获取前置任务名称
      const predecessorNames = task.predecessors && task.predecessors.length > 0 
        ? task.predecessors.map(predId => {
            const predTask = tasks.value.find(t => t.id === predId)
            return predTask ? predTask.text : `任务${predId}`
          }).join(', ')
        : '无'
      
      // 状态映射
      const statusMap = {
        'completed': '已完成',
        'in_progress': '进行中',
        'not_started': '未开始',
        'on_hold': '已暂停',
        'cancelled': '已取消'
      }
      
      // 任务类型映射
      const typeMap = {
        'task': '普通任务',
        'project': '项目组',
        'milestone': '里程碑'
      }
      
      const row = [
        task.id,
        task.text || '',
        task.start_date || '',
        task.end_date || '',
        task.duration || 0,
        Math.round((task.progress || 0) * 100),
        typeMap[task.type] || '普通任务',
        statusMap[task.status] || '未开始',
        task.owner || '',
        task.stakeholder || '',
        parentTaskName,
        predecessorNames,
        task.description || ''
      ]
      excelData.push(row)
    })
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(excelData)
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },   // 任务ID
      { wch: 30 },  // 任务名称
      { wch: 12 },  // 开始时间
      { wch: 12 },  // 完成时间
      { wch: 10 },  // 工期
      { wch: 12 },  // 完成进度
      { wch: 10 },  // 任务类型
      { wch: 10 },  // 执行状态
      { wch: 10 },  // 负责人
      { wch: 10 },  // 相关方
      { wch: 15 },  // 父任务
      { wch: 20 },  // 前置任务
      { wch: 30 }   // 任务描述
    ]
    ws['!cols'] = colWidths
    
    // 设置表头样式
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
    
    // 应用表头样式
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i })
      if (!ws[cellRef]) ws[cellRef] = {}
      ws[cellRef].s = headerStyle
    }
    
    // 添加工作表到工作簿
    const sheetName = projectInfo.value?.name ? `${projectInfo.value.name}-任务列表` : '甘特图任务列表'
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // 生成文件名
    const fileName = `${projectInfo.value?.name || '甘特图'}-${dayjs().format('YYYY-MM-DD')}.xlsx`
    
    // 导出文件
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success(`Excel文件导出成功：${fileName}`)
  } catch (error) {
    console.error('导出Excel数据失败:', error)
    ElMessage.error('Excel导出失败，请重试')
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
  } if (fileType === 'xlsx' || fileType === 'xls') {
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


const getNextId = () => {
  return generateNewTaskId(tasks.value)
}

const updateTaskInArray = (task) => {
  const index = tasks.value.findIndex(t => t.id == task.id)
  console.log('更新任务数组:', { taskId: task.id, index, task })

  if (index !== -1) {
    // 确保所有字段都被正确更新
    tasks.value[index] = {
      ...tasks.value[index],  // 保留原有字段
      ...task  // 覆盖更新的字段
    }

    console.log('任务已更新:', tasks.value[index])

    // 触发响应式更新
    tasks.value = [...tasks.value]
  } else {
    console.error('未找到要更新的任务:', task.id)
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


// 获取可选择的前置任务列表
const availableTasksForPredecessors = (currentTaskId) => {
  return tasks.value.filter(task => {
    // 排除当前任务本身
    if (task.id === currentTaskId) return false

    // 排除已经是当前任务子任务的任务（避免循环依赖）
    if (task.parent === currentTaskId) return false

    // 排除项目类型的任务作为前置任务（项目通常是容器）
    if (task.type === 'project') return false

    return true
  })
}

// 根据前置任务创建链接
const createLinksFromPredecessors = (taskId, predecessors) => {
  if (!predecessors || predecessors.length === 0) return

  predecessors.forEach(predId => {
    const linkId = getNextLinkId()
    const link = {
      id: linkId,
      source: predId,
      target: taskId,
      type: "0"  // 完成-开始关系
    }

    // 添加到links数组
    links.value.push(link)

    // 添加到甘特图
    gantt.addLink(link)
  })
}

// 更新任务链接
const updateTaskLinks = (taskId, oldPredecessors, newPredecessors) => {
  // 删除旧的链接
  oldPredecessors.forEach(predId => {
    const linkToRemove = links.value.find(link =>
      link.source === predId && link.target === taskId
    )
    if (linkToRemove) {
      gantt.deleteLink(linkToRemove.id)
      const linkIndex = links.value.findIndex(link => link.id === linkToRemove.id)
      if (linkIndex !== -1) {
        links.value.splice(linkIndex, 1)
      }
    }
  })

  // 添加新的链接
  const predecessorsToAdd = newPredecessors.filter(predId =>
    !oldPredecessors.includes(predId)
  )
  createLinksFromPredecessors(taskId, predecessorsToAdd)
}

// 获取下一个链接ID
const getNextLinkId = () => {
  if (links.value.length === 0) return 1
  return Math.max(...links.value.map(link => link.id)) + 1
}

// 保存项目
const saveProject = async () => {
  saving.value = true
  try {
    const result = await saveGanttDataToProject(tasks.value, links.value, projectInfo.value)

    // 更新项目信息
    if (result.data) {
      if (!projectInfo.value) {
        projectInfo.value = {}
      }
      Object.assign(projectInfo.value, {
        id: result.data
      })

      // 如果是新建项目，更新URL
      if (!urlParams.value.code && result.data) {
        const newUrl = `${window.location.origin}${window.location.pathname}?code=${result.data}`
        window.history.replaceState({}, '', newUrl)
        urlParams.value.code = result.data
      }

      // 更新页面标题
      if (projectInfo.value.name) {
        document.title = `${projectInfo.value.name} - 星甘`
      }
      
      // 重新检查收藏状态
      checkStarStatus()
    }

    ElMessage.success('项目保存成功')
  } catch (error) {
    if (error.status === 401 || error.code === '401') {
      ElMessage.error('请登录后保存')
      showLoginModal.value = true
    } else if (error.code === 'ERR_NETWORK') {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      // 默认错误处理
      const errorMessage = error.message || error.msg || '保存项目失败，请重试'
      ElMessage.error(errorMessage)
    }
  } finally {
    saving.value = false
  }
}

// 处理登录成功
const handleLoginSuccess = () => {
  ElMessage.success('登录成功，请重新保存项目')
  loadUserInfo();
  showLoginModal.value = false
}

// 切换项目
const switchProject = async (projectCode) => {
  if (!projectCode) {
    return
  }

  try {
    loading.value = true

    gantt.clearAll()

    // 加载新项目数据
    await loadInitialData(projectCode)

    // 更新当前项目代码
    currentProjectCode.value = projectCode

    // 更新URL
    const newUrl = `${window.location.origin}${window.location.pathname}?code=${projectCode}`
    window.history.replaceState({}, '', newUrl)
    urlParams.value = { code: projectCode }

    // 重新渲染甘特图
    loadData()

    ElMessage.success(`已切换到项目: ${projectInfo.value?.name || '未命名项目'}`)
  } catch (error) {
    ElMessage.error('项目切换失败，请重试')
    // 恢复原来的选择
    currentProjectCode.value = urlParams.value?.code || ''
  } finally {
    loading.value = false
  }
}

// 处理更多操作命令
const handleMoreCommand = (command) => {
  switch (command) {
    case 'expand':
      expandAll()
      break
    case 'collapse':
      collapseAll()
      break
    case 'fit':
      zoomToFit()
      break
  }
}

// 处理用户操作命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人设置功能开发中')
      break
    case 'logout':
      userInfo.value = null
      removeToken()
      ElMessage.success('已退出登录')
      break
    case 'login':
      showLoginModal.value = true
      break
  }
}

// 切换项目下拉菜单显示状态
const toggleProjectDropdown = () => {
  projectDropdownVisible.value = !projectDropdownVisible.value
}

// 处理项目下拉菜单显示状态变化
const handleDropdownVisibleChange = (visible) => {
  console.log('Dropdown visible change:', visible)
  // 如果dropdown关闭，取消所有编辑状态
  if (!visible) {
    cancelEdit()
  }
}

// 创建新项目
const createNewProject = () => {
  ElMessageBox.confirm('创建新项目前，注意保存当前项目', '确认创建', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清空数据
    tasks.value = []
    links.value = []
    gantt.clearAll()
    projectInfo.value = {
      code: `GANTT_${Date.now()}`,
      name: '未命名项目',
      description: '新建项目',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    // 重新加载甘特图
    loadData()

    // 清空URL参数
    window.history.replaceState({}, '', window.location.pathname)
    urlParams.value = {}
    
    // 重置收藏状态
    isStarred.value = false

    ElMessage.success('新项目创建成功')
  }).catch(() => {
    ElMessage.info('已取消创建')
  })
}

// 开始编辑字段
const startEdit = (fieldName) => {
  // 重置所有编辑状态
  Object.keys(editingField.value).forEach(key => {
    editingField.value[key] = false
  })

  // 设置当前编辑字段
  editingField.value[fieldName] = true
  editingValue.value = projectInfo.value?.[fieldName] || ''
  originalValue.value = projectInfo.value?.[fieldName] || ''

  //下一个tick时聚焦输入框
  nextTick(() => {
    let inputRef
    if (fieldName === 'name') inputRef = nameInput.value
    else if (fieldName === 'code') inputRef = codeInput.value
    else if (fieldName === 'description') inputRef = descriptionInput.value

    if (inputRef) {
      inputRef.focus()
    }
  })
}

// 确认编辑
const confirmEdit = (fieldName) => {
  if (!projectInfo.value) {
    projectInfo.value = {}
  }

  // 更新项目信息
  projectInfo.value[fieldName] = editingValue.value

  // 重置编辑状态
  editingField.value[fieldName] = false
  editingValue.value = ''
  originalValue.value = ''

  // 自动保存项目
  saveProject()
}

// 取消编辑
const cancelEdit = () => {
  Object.keys(editingField.value).forEach(key => {
    editingField.value[key] = false
  })
  editingValue.value = originalValue.value
  originalValue.value = ''
}


// 更新字段可见性
const updateColumnVisibility = () => {
  console.log('更新字段可见性，当前可见字段:', visibleColumns.value)
  const allColumns = [
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
      align: "center"
    },
    {
      name: "end_date",
      label: "完成时间",
      width: 110,
      align: "center"
    },
    {
      name: "duration",
      label: "工期",
      width: 90,
      align: "center",
      template: function (task) {
        if (task.duration === 0) return "里程碑"
        return task.duration + " 工作日"
      }
    },
    {
      name: "status",
      label: "执行情况",
      width: 100,
      align: "center",
      template: function (task) {
        const statusMap = {
          'completed': '<span style="color: #67c23a;">✅ 已完成</span>',
          'in_progress': '<span style="color: #409eff;">🔄 进行中</span>',
          'not_started': '<span style="color: #909399;">📅 未开始</span>',
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
      template: function (task) {
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
      template: function (task) {
        return task.owner || '<span style="color: #c0c4cc;">未分配</span>'
      }
    },
    {
      name: "stakeholder",
      label: "相关方",
      width: 100,
      align: "center",
      template: function (task) {
        return task.stakeholder || '<span style="color: #c0c4cc;">-</span>'
      }
    },
    {
      name: "predecessors",
      label: "前置任务",
      width: 150,
      align: "center",
      template: function (task) {
        if (task.predecessors && task.predecessors.length > 0) {
          const predecessorNames = task.predecessors.map(predId => {
            const predTask = gantt.getTask(predId)
            return predTask ? predTask.text : `任务${predId}`
          }).join(', ')
          return `<span style="color: #409eff;">${predecessorNames}</span>`
        }
        return '<span style="color: #c0c4cc;">无</span>'
      }
    },
    {
      name: "description",
      label: "任务描述",
      width: 200,
      template: function (task) {
        return task.description || '<span style="color: #c0c4cc;">暂无描述</span>'
      }
    }
  ]

  // 筛选可见列
  const filteredColumns = allColumns.filter(col => visibleColumns.value.includes(col.name))
  gantt.config.columns = filteredColumns
  console.log('过滤后的列:', filteredColumns.map(col => col.name))

  // 重新渲染甘特图
  if (gantt && gantt.render) {
    gantt.render()
    console.log('甘特图已重新渲染')
  }
}

// 计算属性：是否全部选中
const isAllSelected = computed(() => {
  return visibleColumns.value.length === columnOptions.value.length
})

// 切换全选/全不选
const toggleAllColumns = () => {
  if (isAllSelected.value) {
    visibleColumns.value = []
  } else {
    visibleColumns.value = columnOptions.value.map(column => column.name)
  }
}

// 检查收藏状态
const checkStarStatus = () => {
  if (!projectInfo.value?.id || !projectList.value || !userInfo.value) {
    isStarred.value = false
    return
  }
  
  // 检查当前项目是否在用户的项目列表中（已收藏的项目）
  const starProject = projectList.value.find(project => 
    (project.id === projectInfo.value.id || project.code === projectInfo.value.code) &&(project.createUserId != userInfo.value.id)
  )
  isStarred.value = !!starProject
}

// 切换收藏状态
const toggleStar = async () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    showLoginModal.value = true
    return
  }
  
  if (!projectInfo.value?.id) {
    ElMessage.warning('请先保存项目后再收藏')
    return
  }
  
  try {
    starring.value = true
    
    if (isStarred.value) {
      // 取消收藏
      await unstar(projectInfo.value.id)
      isStarred.value = false
      ElMessage.success('已取消收藏')
      
      // 从项目列表中移除
      const index = projectList.value.findIndex(project => 
        project.id === projectInfo.value.id || project.code === projectInfo.value.code
      )
      if (index !== -1) {
        projectList.value.splice(index, 1)
      }
    } else {
      // 添加收藏
      await star(projectInfo.value.id)
      isStarred.value = true
      ElMessage.success('收藏成功')
      
      // 添加到项目列表中
      if (!projectList.value.find(project => 
        project.id === projectInfo.value.id || project.code === projectInfo.value.code
      )) {
        projectList.value.unshift({
          id: projectInfo.value.id,
          code: projectInfo.value.code,
          name: projectInfo.value.name,
          description: projectInfo.value.description
        })
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    if (error.code === '401' || error.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      showLoginModal.value = true
    } else {
      ElMessage.error(isStarred.value ? '取消收藏失败' : '收藏失败')
    }
  } finally {
    starring.value = false
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

/* Outlook风格工具栏 */
.outlook-toolbar {
  display: flex;
  align-items: stretch;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  height: 40px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 品牌区域 */
.brand-section {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 0 16px;
  border-right: 1px solid #dee2e6;
  min-width: 260px;
  height: 100%;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 12px;
}

.logo-icon {
  width: 20px;
  height: 20px;
  color: #0078d4;
}

.app-name {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
}

.project-selector {
  flex: 1;
}

.project-info {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
  justify-content: center;
  height: 32px;
}

.project-info:hover {
  background-color: #f3f2f1;
}

.project-title {
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  line-height: 1.1;
}

.project-meta {
  font-size: 11px;
  color: #605e5c;
  line-height: 1.1;
  margin-top: 1px;
}

.dropdown-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #605e5c;
}

/* 项目下拉菜单 */
.project-menu {
  min-width: 320px;
}

.project-details {
  padding: 16px;
  border-bottom: 1px solid #edebe9;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row .label {
  color: #605e5c;
  font-weight: 500;
}

.detail-row .value {
  color: #323130;
  font-weight: 400;
}

.detail-row .value.readonly {
  color: #909399;
}

/* 可编辑字段样式 */
.editable-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  min-height: 28px;
}

.editable-field:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.editable-field .value.editable {
  flex: 1;
  color: #409eff;
}

.editable-field .edit-icon {
  font-size: 12px;
  color: #c0c4cc;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.editable-field:hover .edit-icon {
  opacity: 1;
}

/* 内联编辑输入框样式 */
.inline-edit-input,
.inline-edit-textarea {
  margin-top: 4px;
}

.inline-edit-input :deep(.el-input__wrapper) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.inline-edit-textarea :deep(.el-textarea__inner) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  resize: none;
}

.textarea-container {
  margin-top: 4px;
}

.edit-hint {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.project-actions {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 操作区域 */
.action-section {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 12px;
  gap: 4px;
  height: 100%;
}

/* 项目切换区域 */
.project-switch-section {
  margin-right: 8px;
}

.project-selector {
  width: 200px;
  height: 32px;
}

.project-selector :deep(.el-input) {
  height: 32px;
}

.project-selector :deep(.el-input__wrapper) {
  border-radius: 3px;
  border: 1px solid #d1d1d1;
  background: #ffffff;
  transition: all 0.15s ease;
  padding-left: 32px;
}

.project-selector :deep(.el-input__wrapper):hover {
  border-color: #c7c7c7;
  background: #f3f2f1;
}

.project-selector :deep(.el-input__wrapper.is-focus) {
  border-color: #0078d4;
  box-shadow: 0 0 0 1px #0078d4;
}

.project-selector :deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
  font-size: 13px;
  color: #323130;
}

.project-selector :deep(.el-input__prefix) {
  left: 8px;
  color: #605e5c;
}

.project-selector :deep(.el-select__caret) {
  color: #605e5c;
  font-size: 12px;
}

/* 项目选项样式 */
.project-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-name {
  font-size: 13px;
  font-weight: 500;
  color: #323130;
  line-height: 1.2;
}

.project-code {
  font-size: 11px;
  color: #605e5c;
  line-height: 1.2;
}

/* Outlook按钮样式 */
.outlook-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 8px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 11px;
  color: #323130;
  gap: 4px;
  min-width: 50px;
}

.outlook-btn:hover {
  background-color: #f3f2f1;
  border-color: #c7c7c7;
  color: #323130;
}

.outlook-btn.primary {
  background-color: #0078d4;
  border-color: #0078d4;
  color: white;
}

.outlook-btn.primary:hover {
  background-color: #106ebe;
  border-color: #106ebe;
  color: white;
}

.outlook-btn.starred {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.outlook-btn.starred:hover {
  background-color: #f78989;
  border-color: #f78989;
  color: white;
}

.outlook-btn .el-icon {
  font-size: 14px;
}

.outlook-btn span {
  font-size: 11px;
  line-height: 1;
  font-weight: 400;
  white-space: nowrap;
}

.dropdown-btn {
  position: relative;
}

.dropdown-btn .dropdown-arrow {
  position: absolute;
  right: 2px;
  bottom: 2px;
  font-size: 8px;
}

/* 分隔线 */
.divider {
  width: 1px;
  height: 24px;
  background-color: #d1d1d1;
  margin: 0 8px;
  align-self: center;
}

/* Outlook选择器 */
.outlook-select {
  width: 90px;
  height: 32px;
}

.outlook-select .el-input__wrapper {
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 3px;
  transition: all 0.15s ease;
}

.outlook-select .el-input__inner {
  font-size: 11px;
  height: 30px;
  line-height: 30px;
}

.outlook-select:hover .el-input__wrapper {
  background-color: #f3f2f1;
  border-color: #c7c7c7;
}

/* 字段控制面板 */
.column-control-panel {
  padding: 16px;
  min-width: 180px;
}

.panel-header {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 12px;
}

.panel-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.panel-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  color: #409eff;
}

.panel-actions .el-button:hover {
  color: #66b1ff;
  background-color: rgba(64, 158, 255, 0.1);
}

.panel-actions .el-button.is-disabled {
  color: #c0c4cc;
}

.panel-actions .el-button.is-disabled:hover {
  color: #c0c4cc;
  background-color: transparent;
}

.column-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-checkboxes .el-checkbox {
  margin: 0;
}

.column-checkboxes .el-checkbox__label {
  font-size: 13px;
  color: #323130;
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 0 12px;
  border-left: 1px solid #dee2e6;
  min-width: 120px;
  height: 100%;
}

.user-dropdown {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  width: 100%;
  height: 32px;
}

.user-info:hover {
  background-color: #f3f2f1;
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-size: 12px;
  color: #323130;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 用户下拉菜单 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #edebe9;
}

.profile-info .name {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 2px;
}

.profile-info .email {
  font-size: 12px;
  color: #605e5c;
}

.gantt-container {
  flex: 1;
  padding: 3px;
  overflow: hidden;
  height: calc(100vh - 48px);
  /* 减去顶部工具栏的高度 */
}

.gantt-chart {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: auto;
  /* 允许滚动 */
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
  padding: 4px 6px;
}

:deep(.gantt_row) {
  min-height: 28px;
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
  background: repeating-linear-gradient(90deg,
      transparent,
      transparent 99px,
      rgba(0, 0, 0, 0.02) 100px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .brand-section {
    min-width: 220px;
    padding: 0 12px;
  }

  .action-section {
    padding: 0 8px;
    gap: 3px;
  }

  .divider {
    margin: 0 6px;
  }

  .outlook-btn {
    min-width: 45px;
    padding: 0 6px;
  }

  .outlook-btn span {
    font-size: 10px;
  }

  .outlook-select {
    width: 80px;
  }

  .user-section {
    min-width: 100px;
    padding: 0 8px;
  }
}

@media (max-width: 992px) {
  .outlook-toolbar {
    height: auto;
    min-height: 48px;
  }

  .brand-section {
    min-width: 180px;
  }

  .action-section {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .action-section::-webkit-scrollbar {
    display: none;
  }

  .user-section {
    min-width: 90px;
  }
}

@media (max-width: 768px) {
  .outlook-toolbar {
    min-height: auto;
  }

  .brand-section {
    padding: 0 16px;
    min-width: 180px;
  }

  .app-name {
    font-size: 14px;
  }

  .logo-icon {
    width: 20px;
    height: 20px;
  }

  .project-title {
    font-size: 13px;
  }

  .project-meta {
    font-size: 11px;
  }

  .action-section {
    padding: 0 8px;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .button-group {
    flex-shrink: 0;
  }

  .divider {
    margin: 0 6px;
    height: 32px;
  }

  .outlook-btn {
    min-width: 44px;
    padding: 4px 6px;
    min-height: 36px;
  }

  .outlook-btn .el-icon {
    font-size: 14px;
  }

  .outlook-btn span {
    font-size: 9px;
  }

  .group-label {
    font-size: 9px;
  }

  .user-section {
    min-width: 100px;
    padding: 0 12px;
  }

  .user-name {
    font-size: 12px;
  }

  .gantt-container {
    padding: 8px;
    height: calc(100vh - 140px);
  }
}

@media (max-width: 480px) {
  .brand-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
  }

  .app-logo {
    margin-right: 0;
  }

  .project-selector {
    width: 100%;
  }

  .action-section {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 8px;
  }

  .button-group {
    margin: 0;
  }

  .divider {
    display: none;
  }

  .user-section {
    width: 100%;
    justify-content: center;
    padding: 8px;
  }
}
</style>