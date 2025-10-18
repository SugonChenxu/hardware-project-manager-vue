<template>
  <div class="gantt-page">
    <!-- 顶部工具栏 - Outlook风格 -->
    <div class="outlook-toolbar">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="app-logo">
          <img class="logo-icon" src="/favicon-32x32.png" alt="星甘StarGantt" />
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

                  <div class="detail-row">
                    <span class="label">创建人</span>
                    <span class="value readonly">{{ projectInfo?.createUserName }}</span>
                    <el-button type="danger" v-if="projectInfo?.createUserId == userInfo?.id" size="small"
                      @click="deleteProject">删除</el-button>
                  </div>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-button class="outlook-btn" :class="{ 'starred': isStarred }" @click="toggleStar" :loading="starring"
          v-if="userInfo == null || (userInfo && (projectInfo == null || projectInfo.createUserId != userInfo.id))">
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
          <span>新项目</span>
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
          <span>新任务</span>
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
              <el-dropdown-item command="toggleDragSort" divided>
                <el-icon>
                  <Sort />
                </el-icon>{{ dragSortEnabled ? '禁用拖拽排序' : '启用拖拽排序' }}
              </el-dropdown-item>
              <el-dropdown-item disabled v-if="dragSortEnabled">
                <span style="font-size: 11px; color: #909399;">💡 拖拽表格行可调整任务顺序</span>
              </el-dropdown-item>
              <el-dropdown-item command="markBackground" divided :disabled="!currentTask">
                <el-icon>
                  <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                    <path fill="currentColor"
                      d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM888 792H136V232h752v560z" />
                    <path fill="currentColor"
                      d="M424 352c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V352z" />
                    <path fill="currentColor"
                      d="M664 352c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V352z" />
                  </svg>
                </el-icon>标记背景色
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
          <el-option label="默认视图" value="default" />
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
                  <el-button size="small" type="text" @click="selectAllColumns" title="列表">
                    📊
                  </el-button>
                  <el-button size="small" type="text" @click="selectHalfColumns" title="平衡">
                    ↔️
                  </el-button>
                  <el-button size="small" type="text" @click="unselectAllColumns" title="甘特图">
                    📈
                  </el-button>
                </div>
                <el-checkbox-group v-model="visibleColumns" class="column-checkboxes">
                  <el-checkbox v-for="column in allColumns" :key="column.name" :label="column.name">
                    {{ column.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-tooltip content="开启后，修改任务时间会自动调整有关联关系的任务时间" placement="bottom">
          <el-switch v-model="cascade" size="small" inline-prompt active-text="关联调整">
          </el-switch>
        </el-tooltip>

        <div class="divider"></div>

        <el-button class="outlook-btn" @click="exportData">
          <el-icon>
            <Download />
          </el-icon>
          <span>导出</span>
        </el-button>

        <!-- 帮助按钮 -->
        <el-button class="outlook-btn" @click="openHelp">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          <span>帮助</span>
        </el-button>

        <!-- 客服联系按钮 -->
        <el-button class="outlook-btn" @click="contactService">
          <el-icon>
            <ChatDotSquare />
          </el-icon>
          <span>客服</span>
        </el-button>
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
    <div class="gantt-container" :class="{ 'grid-resizing': isGridResizing }">
      <div ref="ganttContainer" class="gantt-chart"></div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv,.json" @change="handleFileUpload"
      style="display: none;" />

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
                <el-option v-for="task in tasks.filter(t => t.id !== editTask.id)" :key="task.id"
                  :label="task.id + ' - ' + task.text" :value="task.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="前置任务">
          <el-select v-model="editTask.predecessors" multiple placeholder="选择前置任务（可选）" style="width: 100%">
            <el-option v-for="task in availableTasksForPredecessors(editTask.id)" :key="task.id"
              :label="`${task.id} - ${task.text}`" :value="task.id" />
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

    <!-- 个人中心对话框 -->
    <el-dialog v-model="userCenterVisible" title="个人中心" width="800px" :close-on-click-modal="false"
      class="user-center-dialog">
      <UserCenter v-if="userCenterVisible" />
    </el-dialog>

    <!-- 客服联系对话框 -->
    <ContactServiceDialog v-model="showContactDialog" />

    <!-- 背景色选择对话框 -->
    <el-dialog v-model="showBackgroundColorDialog" title="标记背景色" width="400px" :close-on-click-modal="false">
      <div class="background-color-selector">
        <div class="current-task-info" v-if="currentTask">
          <span class="task-label">当前任务：</span>
          <span class="task-name">{{ currentTask.text }}</span>
        </div>

        <div class="color-options">
          <div v-for="color in backgroundColors" :key="color.name" class="color-option"
            @click="setTaskBackgroundColor(color.css)">
            <div class="color-preview" :style="{
              backgroundColor: color.value || '#ffffff',
              border: color.value ? '1px solid #dcdfe6' : '2px dashed #dcdfe6'
            }">
              <div v-if="color.name !== '清除'" class="color-dot" :style="{ backgroundColor: color.color }"></div>
              <el-icon v-else class="clear-icon">
                <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                  <path fill="currentColor"
                    d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zM288 312v-48a24 24 0 0 1 24-24h400a24 24 0 0 1 24 24v48a24 24 0 0 1-24 24H312a24 24 0 0 1-24-24z" />
                </svg>
              </el-icon>
            </div>
            <span class="color-name">{{ color.name }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showBackgroundColorDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { getUserProfile } from '../api/login.js'
import UserCenter from './UserCenter.vue'
import ContactServiceDialog from './ContactServiceDialog.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ElConfigProvider, ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as XLSX from 'xlsx'

// 设置dayjs为中文
dayjs.locale('zh-cn')
import {
  Calendar, Plus, Expand, Fold, FullScreen, Download, Upload, Document,
  ArrowDown, FolderAdd, Operation, MoreFilled, User, Edit, Star, StarFilled, ChatDotSquare, Sort, QuestionFilled
} from '@element-plus/icons-vue'
import {
  loadGanttData,
  saveGanttDataToProject,
  load,
  importFromJson,
  generateNewTaskId,
  getAllSuccessors,
  getAllPredecessors
} from '../services/ganttDataService.js'
import { star, unstar, del } from '../api/sysproject.js'
import LoginModal from './LoginModal.vue'
import { getToken, removeToken } from '../utils/auth.js'
import { getWebVersion } from '../api/serverConf.js'
import { getItem, setItem } from '../utils/storage.js'

// 中文语言包
const locale = zhCn

// 响应式数据
const ganttContainer = ref()
const currentTask = ref(null)  //当前选中的任务
const fileInput = ref()
const nameInput = ref()
const codeInput = ref()
const descriptionInput = ref()
const viewMode = ref('default')
const showEditDialog = ref(false)  // 编辑对话框显示状态
const showLoginModal = ref(false)  // 登录模态框显示状态
const userCenterVisible = ref(false)  // 个人中心对话框显示状态
const showContactDialog = ref(false)  // 客服联系对话框显示状态
const pendingUserCenterOpen = ref(false)  // 待打开个人中心标志
const saving = ref(false) // 保存按钮加载状态

// 任务数据 - 从数据服务加载
const tasks = ref([])
const links = ref([])
const loading = ref(true)
const cascade = ref(true)  //级联

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

// 版本号管理
const webVersion = ref('')

// 拖拽排序开关
const dragSortEnabled = ref(true)

// 背景色标记功能
const showBackgroundColorDialog = ref(false)
const backgroundColors = [
  { name: '红色', css: 'gantt_custom_red', value: '#ffebee', color: '#f44336' },
  { name: '黄色', css: 'gantt_custom_yellow', value: '#fffde7', color: '#ffeb3b' },
  { name: '绿色', css: 'gantt_custom_green', value: '#e8f5e8', color: '#4caf50' },
  { name: '蓝色', css: 'gantt_custom_blue', value: '#e3f2fd', color: '#2196f3' },
  { name: '清除', css: '', value: '', color: '#ffffff' }
]

// Grid和Timeline分割线拖拽相关状态
const isGridResizing = ref(false)
const gridWidth = ref(1330) // 默认Grid宽度
const startGridX = ref(0)
const startGridWidth = ref(0)
const minGridWidth = 300 // 最小Grid宽度
const maxGridWidth = 1600 // 最大Grid宽度

// 从localStorage加载Grid宽度设置
const loadGridWidth = () => {
  try {
    const savedWidth = getItem('gantt_grid_width')
    if (savedWidth) {
      gridWidth.value = parseInt(savedWidth)
    }
  } catch (error) {
    console.error('加载Grid宽度设置失败:', error)
  }
}

// 保存Grid宽度设置到localStorage
const saveGridWidth = () => {
  try {
    setItem('gantt_grid_width', gridWidth.value.toString())
  } catch (error) {
    console.error('保存Grid宽度设置失败:', error)
  }
}

// 开始拖拽调整Grid宽度
const startGridResize = (event) => {
  event.preventDefault()
  event.stopPropagation()

  isGridResizing.value = true
  startGridX.value = event.clientX
  startGridWidth.value = gridWidth.value

  // 添加全局事件监听
  document.addEventListener('mousemove', handleGridResize)
  document.addEventListener('mouseup', endGridResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 处理Grid宽度调整
const handleGridResize = (event) => {
  if (!isGridResizing.value) return

  const deltaX = event.clientX - startGridX.value
  const newWidth = Math.max(minGridWidth, Math.min(maxGridWidth, startGridWidth.value + deltaX))

  gridWidth.value = newWidth

  // 立即更新甘特图Grid宽度
  updateGanttGridWidth()
}

// 结束Grid宽度调整
const endGridResize = () => {
  if (isGridResizing.value) {
    isGridResizing.value = false

    // 保存Grid宽度设置
    saveGridWidth()

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleGridResize)
    document.removeEventListener('mouseup', endGridResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}

// 更新甘特图Grid宽度
const updateGanttGridWidth = () => {
  if (gantt && gantt.config) {
    gantt.config.grid_width = gridWidth.value

    // 更新布局配置
    gantt.config.layout = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", id: "grid", width: gridWidth.value, scrollY: "scrollVer" },
            {
              rows: [
                { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", scroll: "x", id: "scrollHor" }
              ]
            },
            { view: "scrollbar", scroll: "y", id: "scrollVer" }
          ]
        }
      ]
    }

    // 重新渲染甘特图
    if (gantt.render) {
      gantt.render()
    }
  }
}

// 根据可见列调整Grid宽度
const adjustGridWidthByColumns = (visibleCols) => {
  if (!visibleCols || visibleCols.length === 0) {
    // 如果没有可见列，设置最小宽度
    gridWidth.value = minGridWidth
    updateGanttGridWidth()
    saveGridWidth()
    return
  }

  // 计算所有可见列的总宽度，使用原始allColumns定义中的宽度
  let totalWidth = 0
  visibleCols.forEach(col => {
    // 从原始allColumns定义中查找对应列的宽度
    const originalCol = allColumns.find(originalCol => originalCol.name === col.name)
    const colWidth = originalCol ? originalCol.width : (col.width || 100)
    totalWidth += colWidth
  })

  // 添加一些额外的padding和滚动条宽度
  const padding = 40 // 内边距和边框等
  const scrollbarWidth = 20 // 垂直滚动条宽度
  const calculatedWidth = totalWidth + padding + scrollbarWidth

  // 确保在最小和最大宽度范围内
  const newWidth = Math.max(minGridWidth, Math.min(maxGridWidth, calculatedWidth))

  // 只有当宽度变化足够大时才更新（避免频繁的微小调整）
  if (Math.abs(newWidth - gridWidth.value) > 10) {
    gridWidth.value = newWidth
    updateGanttGridWidth()
    saveGridWidth()
    console.log(`Grid宽度调整: 可见列${visibleCols.length}个, 计算宽度${calculatedWidth}px, 实际设置${newWidth}px`)
  }
}


// 添加Grid分割线拖拽手柄
const addGridResizeHandle = () => {
  nextTick(() => {
    // 移除旧的拖拽手柄
    const existingHandle = document.querySelector('.grid-resize-handle')
    if (existingHandle) {
      existingHandle.remove()
    }

    // 查找Grid容器
    const gridContainer = document.querySelector('.gantt_grid')
    if (!gridContainer) return

    // 创建拖拽手柄
    const handle = document.createElement('div')
    handle.className = 'grid-resize-handle'
    handle.title = '拖拽调整表格宽度'

    // 添加事件监听
    handle.addEventListener('mousedown', startGridResize)

    // 添加到Grid容器
    gridContainer.style.position = 'relative'
    gridContainer.appendChild(handle)
  })
}

// 版本检查函数
const checkVersionAndRefresh = async () => {
  try {
    // 获取服务器版本号
    const serverVersionResponse = await getWebVersion()
    if (serverVersionResponse.code === 200) {
      const serverVersion = serverVersionResponse.data
      webVersion.value = serverVersion

      // 获取本地存储的版本号
      const localVersion = getItem('webVersion')

      // 如果本地版本为空或与服务器版本不同，强制刷新
      if (!localVersion || localVersion !== serverVersion) {
        console.log('版本号不匹配，强制刷新页面')
        console.log('本地版本:', localVersion)
        console.log('服务器版本:', serverVersion)

        // 更新本地存储的版本号
        setItem('webVersion', serverVersion)

        // 强制刷新页面
        window.location.reload(true)
        return
      }

      console.log('版本号匹配，无需刷新')
    }
  } catch (error) {
    console.error('版本检查失败:', error)
    // 版本检查失败时，不进行刷新，避免影响正常使用
  }
}

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


// 可显示的字段
const visibleColumns = ref(['id', 'text', 'start_date', 'end_date', 'duration', 'status', 'progress', 'owner', 'stakeholder', 'predecessors', 'description'])

const allColumns = [
  {
    name: "id",
    label: "ID",
    width: 30,
  },
  {
    name: "text",
    label: "任务名称",
    width: 280,
    tree: true,
    editor: {
      type: "text",
      map_to: "text"
    }
  },
  {
    name: "start_date",
    label: "开始时间",
    width: 100,
    align: "center",
    editor: {
      type: "date",
      map_to: "start_date"
    }
  },
  {
    name: "end_date",
    label: "完成时间",
    width: 100,
    align: "center",
    editor: {
      type: "date",
      map_to: "end_date"
    }
  },
  {
    name: "duration",
    label: "工期",
    width: 60,
    align: "center",
    editor: {
      type: "number",
      map_to: "duration",
      min: 0,
      max: 365
    },
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
    editor: {
      type: "select",
      map_to: "status",
      options: [
        { key: "not_started", label: "未开始" },
        { key: "in_progress", label: "进行中" },
        { key: "completed", label: "已完成" },
        { key: "on_hold", label: "已暂停" },
        { key: "cancelled", label: "已取消" }
      ]
    },
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
    editor: {
      type: "number",
      map_to: "progress",
      min: 0,
      max: 1
    },
    template: function (task) {
      const percent = Math.round(task.progress * 100)
      let color = '#909399'
      if (percent == 100) color = '#67c23a'
      else if (percent >= 10) color = '#409eff'

      return `<span style="color: ${color}; font-weight: bold;">${percent}%</span>`
    }
  },
  {
    name: "owner",
    label: "负责人",
    width: 90,
    align: "center",
    editor: {
      type: "text",
      map_to: "owner"
    },
    template: function (task) {
      return task.owner || '<span style="color: #c0c4cc;">-</span>'
    }
  },
  {
    name: "stakeholder",
    label: "相关方",
    width: 100,
    align: "center",
    editor: {
      type: "text",
      map_to: "stakeholder"
    },
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
    editor: {
      type: "text",
      map_to: "description"
    },
    template: function (task) {
      const description = task.description || ''
      if (description) {
        // 如果description长度超过20个字符，显示省略号并在title中显示完整内容
        const displayText = description.length > 20 ? description.substring(0, 20) + '...' : description
        return `<span title="${description.replace(/"/g, '&quot;')}">${displayText}</span>`
      }
      return '<span style="color: #c0c4cc;">-</span>'
    }
  }
]

// 生命周期钩子
onMounted(async () => {
  // 首先进行版本检查，如果版本不匹配会自动刷新页面
  await checkVersionAndRefresh()

  // 加载Grid宽度设置
  loadGridWidth()

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
  // 清理Grid拖拽事件监听器
  if (isGridResizing.value) {
    document.removeEventListener('mousemove', handleGridResize)
    document.removeEventListener('mouseup', endGridResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
})

const contactService = () => {
  showContactDialog.value = true
}

const openHelp = () => {
  // 在新标签页打开帮助页面
  window.open('/help', '_blank')
}

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

// 监听拖拽排序开关变化
watch(dragSortEnabled, (enabled) => {
  if (gantt && gantt.config) {
    if (enabled) {
      gantt.config.order_branch = true
      gantt.config.order_branch_free = true
      // 如果任务数量较多，使用marker模式提升性能
      if (tasks.value.length > 50) {
        gantt.config.order_branch = "marker"
      }
      ElMessage.success('拖拽排序已启用')
    } else {
      gantt.config.order_branch = false
      gantt.config.order_branch_free = false
      ElMessage.success('拖拽排序已禁用')
    }

    // 重新渲染甘特图以应用配置
    if (gantt.render) {
      gantt.render()
    }
  }
})

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
    document.title = `${projectInfo.value.name} - 星甘StarGantt|简洁易用的在线甘特图制作平台|专业的项目进度管理工具`

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
    gantt.config.grid_width = gridWidth.value
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.drag_progress = true
    gantt.config.sort = true
    gantt.config.scrollY = "y"     // 启用垂直滚动
    gantt.config.scrollX = "x"     // 启用水平滚动

    // 启用行拖动排序功能
    gantt.config.order_branch = true        // 启用同级任务拖动排序
    gantt.config.order_branch_free = true   // 启用跨级任务拖动排序

    // 如果任务数量较多，使用marker模式提升性能
    if (tasks.value.length > 50) {
      gantt.config.order_branch = "marker"
    }

    // 时间轴列宽配置
    gantt.config.min_column_width = 30  // 最小列宽（像素）
    gantt.config.subscales = []         // 子刻度配置

    //自定义布局，只有甘特图timeline部分需要横向滚动条
    gantt.config.layout = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", id: "grid", width: gridWidth.value, scrollY: "scrollVer" },
            {
              rows: [
                { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", scroll: "x", id: "scrollHor" }
              ]
            },
            { view: "scrollbar", scroll: "y", id: "scrollVer" }
          ]
        }
      ]
    };

    // 时间刻度配置
    setTimeScale(viewMode.value)

    // 列配置 - 使用深拷贝确保不修改原始定义
    gantt.config.columns = allColumns.map(col => ({ ...col }))

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

    // 启用内联编辑功能
    gantt.config.readonly = false            // 保持可编辑状态
    gantt.config.drag_links = true          // 启用拖拽创建依赖
    gantt.config.details_on_dblclick = false // 禁用双击打开详情，使用自定义编辑对话框
    gantt.config.inline_editors_date_format = "%Y-%m-%d"  // 日期编辑器格式

    // 防止列宽度自动调整
    gantt.config.fit_tasks = false          // 禁用任务自动适应
    gantt.config.grid_elastic_columns = false // 禁用弹性列宽

    // 禁用内置弹窗，使用自定义编辑对话框
    gantt.config.lightbox = {
      sections: []  // 清空所有内置编辑器配置
    }

    // 网格行样式
    gantt.templates.grid_row_class = function (start, end, task) {
      let css = ""
      if (task.type === 'project') {
        css += "gantt_project_row "
      }
      // 添加背景色样式
      if (task.backgroundColor) {
        css += task.backgroundColor + ' '
      }
      return css
    }

    // 时间轴列样式 - 周末区分
    gantt.templates.timeline_cell_class = function (task, date) {
      let css = ""
      const day = date.getDay()

      // 周六 (6) 和周日 (0) 添加周末样式
      if (day === 0 || day === 6) {
        css += "gantt_saturday "
      }

      return css
    }

    gantt.plugins({
        keyboard_navigation: true,
        undo: true
    });

    // 添加快捷键ctrl+s保存项目
    gantt.addShortcut("ctrl+s", function(e){ 
        saveProject();
    });

    // 添加快捷键ctrl+z撤销
    gantt.addShortcut("ctrl+z", function(e){ 
        gantt.undo();
    });

    // 添加快捷键ctrl+q新建任务
    gantt.addShortcut("ctrl+q", function(e){ 
        addTask();
    });

    // 事件监听
    gantt.attachEvent("onTaskClick", (id, e) => {
      currentTask.value = gantt.getTask(id)
      return true
    })

    //拖动链接甘特图两个任务时建立关系
    gantt.attachEvent("onAfterLinkAdd", function (id, link) {
      console.log('onAfterLinkAdd:', id, link)
      //判断link是否存在
      if (links.value.find(l => l.id == id)) {
        return
      }

      const newlink = {
        id: getNextLinkId(),
        source: parseInt(link.source),
        target: parseInt(link.target),
        type: "0"  // 完成-开始关系
      }
      //更新task的前置任务
      const task = tasks.value.find(t => t.id == newlink.target)
      if (task != null && task.predecessors != null && task.predecessors.indexOf(newlink.source) == -1) {
        task.predecessors.push(newlink.source)
      }

      // 添加到links数组
      links.value.push(newlink)
    })

    // 添加双击事件监听
    gantt.attachEvent("onTaskDblClick", (id, e) => {
      const task = gantt.getTask(id)
      openEditDialog(task)
      return false  // 阻止默认行为
    })

    // 添加行拖动排序事件监听
    gantt.attachEvent("onBeforeRowDragEnd", (id, parent, tindex) => {
      console.log('拖动排序前:', { id, parent, tindex })

      // 检查是否启用拖拽排序
      if (!dragSortEnabled.value) {
        ElMessage.warning('拖拽排序功能已禁用')
        return false
      }

      // 获取被拖动的任务
      const draggedTask = gantt.getTask(id)

      // 可以添加更多限制逻辑
      // 例如：防止里程碑任务被拖拽到项目任务下面
      if (draggedTask.type === 'milestone' && parent !== draggedTask.parent) {
        ElMessage.warning('里程碑任务不能移动到其他父任务下')
        return false
      }

      return true  // 允许拖动
    })

    gantt.attachEvent("onRowDragEnd", (id, target) => {
      console.log('拖动排序完成:', { id, target })

      // 更新本地任务数组的顺序
      updateTaskOrderInArray(id, target)

      ElMessage.success('任务顺序已调整')
    })

    // 添加行拖动开始事件
    gantt.attachEvent("onRowDragStart", (id, target, e) => {
      console.log('开始拖动任务:', id)

      // 检查是否启用拖拽排序
      if (!dragSortEnabled.value) {
        return false
      }

      return true
    })

    gantt.attachEvent("onBeforeTaskChanged", (id, mode, oldTask) => {
      console.log(`onBeforeTaskChanged:`, id, mode)
      let newTaskObj = tasks.value.find(t => t.id == oldTask.id)
      updateCascade(oldTask, newTaskObj)
      return true;
    })

    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      //todo: 这个task是更新后的task，无法获取更新前的task,因此不能级联更新updateCascade
      console.log(`onAfterTaskUpdate:`, id)
    })


    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
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

      // 初始化完成后，根据可见列调整Grid宽度
      const initialVisibleCols = visibleColumns.value.map(col => allColumns.find(c => c.name === col))
      adjustGridWidthByColumns(initialVisibleCols)
    }, 100)

    // 加载数据
    loadData()

    // 添加Grid分割线拖拽手柄
    gantt.attachEvent("onGanttRender", () => {
      addGridResizeHandle()
    })

    // 初始添加拖拽手柄
    setTimeout(() => {
      addGridResizeHandle()
    }, 500)
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
      gantt.config.min_column_width = 80  // 日视图：每天80像素
      gantt.config.subscales = [
        { unit: 'hour', step: 6, date: '%H:%i' }
      ]
      break
    case 'default':
      gantt.config.scale_unit = 'month'
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      gantt.config.min_column_width = 30  // 默认视图：每天30像素
      gantt.config.subscales = [
        {
          unit: 'day', step: 1, date: '%d', css: function (date) {
            let css = ""
            const day = date.getDay()

            // 周六 (6) 和周日 (0) 添加周末样式
            if (day === 0 || day === 6) {
              css += "gantt_scale_saturday "
            }

            return css

          }
        }
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      gantt.config.min_column_width = 100  // 月视图：每月100像素
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
      gantt.config.min_column_width = 150  // 季度视图：每季度150像素
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
}

// 切换视图
const changeView = (mode) => {
  setTimeScale(mode)
  gantt.render()
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
  const startDate = currentTask.value ? currentTask.value.end_date : new Date()  //如果选中了，则直接用选中任务的结束日期
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 默认3天后

  const task = {
    id: getNextId(),
    text: '',
    start_date: dayjs(startDate).format('YYYY-MM-DD'),
    end_date: dayjs(endDate).format('YYYY-MM-DD'),
    duration: 3,
    progress: 0,
    type: 'task',
    parent: currentTask.value ? currentTask.value.parent : 0,
    status: 'not_started',
    owner: '',
    stakeholder: '',
    description: '',
    predecessors: [],
    backgroundColor: ''
  }

  gantt.addTask(task, currentTask.value ? currentTask.value.parent : 0)

  if (currentTask.value) {
    // 将新任务插入到tasks数组中选中任务的下一个位置
    const taskIndex = tasks.value.findIndex(t => t.id == task.id)
    if (taskIndex !== -1) {
      // 从原位置移除
      const [newTaskObj] = tasks.value.splice(taskIndex, 1)
      // 插入到选中任务的下一个位置
      tasks.value.splice(currentTask.value.$index + 1, 0, newTaskObj)

      // 重新加载甘特图数据以更新显示顺序
      gantt.clearAll()
      loadData()
    }
  }
  //定位到最新插入的任务并聚焦文本列
  gantt.showTask(task.id)

  // 聚焦文本列
  setTimeout(() => {
    const taskRow = document.querySelector(`.gantt_row[task_id="${task.id}"]`)
    if (taskRow) {
      const textCell = taskRow.querySelector('.gantt_cell:nth-child(2)')
      if (textCell) {
        textCell.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => {
          const input = document.querySelector('.gantt_grid input')
          if (input) {
            input.focus()
            input.select()
          }
        }, 100)
      }
    }
  }, 300)

  // 根据前置任务创建链接
  createLinksFromPredecessors(task.id, task.predecessors)
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
    predecessors: task.predecessors || [],
    backgroundColor: task.backgroundColor || ''
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
    predecessors: editTask.value.predecessors || [],
    backgroundColor: editTask.value.backgroundColor || ''
  }

  try {

    // 获取原任务
    const originalTask = gantt.getTask(editTask.value.id)
    const newPredecessors = updatedTask.predecessors || []

    // 更新前置任务链接
    updateTaskLinks(editTask.value.id, newPredecessors)

    updateCascade(originalTask, updatedTask)

    // 更新甘特图中的任务
    gantt.updateTask(editTask.value.id, updatedTask)

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

// 级联更新任务
const updateCascade = (originalTask, updatedTask) => {
  if (!cascade.value) return;

  //如果改变了结束日期，则更新所有的后续任务开始和结束日期
  if (originalTask.end_date !== updatedTask.end_date) {
    //计算改变的日期差
    const dateDiff = dayjs(updatedTask.end_date).diff(dayjs(originalTask.end_date), 'day')
    let successors = getAllSuccessors(updatedTask.id, links.value)
    successors.forEach(successorId => {
      let index = tasks.value.findIndex(t => t.id === successorId)
      if (index !== -1) {
        tasks.value[index].start_date = dayjs(tasks.value[index].start_date).add(dateDiff, 'day').toDate()
        tasks.value[index].end_date = dayjs(tasks.value[index].end_date).add(dateDiff, 'day').toDate()
      }
    })
  }

  //如果改变了开始日期，则更新所有的前置任务开始和结束日期
  if (originalTask.start_date !== updatedTask.start_date) {
    //计算改变的日期差
    const dateDiff = dayjs(updatedTask.start_date).diff(dayjs(originalTask.start_date), 'day')
    let predecessors = getAllPredecessors(updatedTask.id, links.value)
    predecessors.forEach(predecessorId => {
      let index = tasks.value.findIndex(t => t.id === predecessorId)
      if (index !== -1) {
        tasks.value[index].start_date = dayjs(tasks.value[index].start_date).add(dateDiff, 'day').toDate()
        tasks.value[index].end_date = dayjs(tasks.value[index].end_date).add(dateDiff, 'day').toDate()
      }
    })
  }

  setTimeout(() => {
    gantt.render()
  }, 100)

}

// 设置任务背景色
const setTaskBackgroundColor = (colorValue) => {
  if (!currentTask.value) {
    ElMessage.warning('请先选择一个任务')
    return
  }

  try {
    // 更新任务的背景色属性
    const task = gantt.getTask(currentTask.value.id)
    task.backgroundColor = colorValue

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].backgroundColor = colorValue
    }


    showBackgroundColorDialog.value = false

    const colorName = backgroundColors.find(c => c.value === colorValue)?.name || '自定义'
    ElMessage.success(`已设置任务背景色为${colorName}`)
  } catch (error) {
    console.error('设置背景色失败:', error)
    ElMessage.error('设置背景色失败')
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

// 导出Excel数据
const exportData = () => {
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

const addTaskToArray = (task) => {
  tasks.value.push({ ...task })
}

const removeTaskFromArray = (id) => {
  const index = tasks.value.findIndex(t => t.id == id)
  if (index !== -1) {
    tasks.value.splice(index, 1)
  }
}

// 更新任务在数组中的顺序
const updateTaskOrderInArray = (draggedTaskId, targetInfo) => {
  try {
    const draggedTaskIndex = tasks.value.findIndex(t => t.id == draggedTaskId)
    if (draggedTaskIndex === -1) {
      console.error('未找到被拖动的任务:', draggedTaskId)
      return
    }

    // 移除被拖动的任务
    const [draggedTask] = tasks.value.splice(draggedTaskIndex, 1)

    let targetIndex = 0
    let isNext = false

    // 解析target信息
    if (typeof targetInfo === 'string' && targetInfo.startsWith('next:')) {
      // target格式为 "next:targetId"，表示应该插入到目标任务之后
      const targetId = targetInfo.substring(5) // 移除 "next:" 前缀
      const targetTaskIndex = tasks.value.findIndex(t => t.id == targetId)
      if (targetTaskIndex !== -1) {
        targetIndex = targetTaskIndex + 1
        isNext = true
      }
    } else {
      // target为任务ID，表示应该插入到目标任务之前
      const targetTaskIndex = tasks.value.findIndex(t => t.id == targetInfo)
      if (targetTaskIndex !== -1) {
        targetIndex = targetTaskIndex
      }
    }

    // 确保索引在有效范围内
    targetIndex = Math.max(0, Math.min(targetIndex, tasks.value.length))

    // 插入到新位置
    tasks.value.splice(targetIndex, 0, draggedTask)

    console.log('任务顺序已更新:', {
      draggedTaskId,
      targetInfo,
      targetIndex,
      isNext,
      totalTasks: tasks.value.length
    })

    // 触发响应式更新
    tasks.value = [...tasks.value]
  } catch (error) {
    console.error('更新任务顺序失败:', error)
    ElMessage.error('更新任务顺序失败')
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
const updateTaskLinks = (taskId, newPredecessors) => {
  // 删除旧的链接
  let linkToRemoves = links.value.filter(link => link.target === taskId)
  linkToRemoves.forEach(link => {
    console.log('删除链接:', link)
    gantt.deleteLink(link.id)
    const linkIndex = links.value.findIndex(l => l.id === link.id)
    if (linkIndex !== -1) {
      links.value.splice(linkIndex, 1)
    }
  })
  createLinksFromPredecessors(taskId, newPredecessors)
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

      // 如果是新建项目，更新URL
      if (!urlParams.value.code && result.data) {
        const newUrl = `${window.location.origin}${window.location.pathname}?code=${projectInfo.value.code}`
        window.history.replaceState({}, '', newUrl)
        urlParams.value.code = projectInfo.value.code
      }

      // 更新页面标题
      if (projectInfo.value.name) {
        document.title = `${projectInfo.value.name} - 星甘StarGantt|简洁易用的在线甘特图制作平台|专业的项目进度管理工具`
      }

      // 重新检查收藏状态
      checkStarStatus()
    }

    ElMessage.success('项目保存成功')
  } catch (error) {
    if (error.status === 401 || error.code == '401') {
      ElMessage.error('请登录后保存')
      showLoginModal.value = true
    } else if (error.code == '50010') { //等级不够，直接显示个人中心
      ElMessage.error(error.message)
      userCenterVisible.value = true
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
  loadUserInfo();
  showLoginModal.value = false
  // 如果用户是通过个人中心触发的登录，登录成功后自动打开个人中心
  if (pendingUserCenterOpen.value) {
    userCenterVisible.value = true
    pendingUserCenterOpen.value = false
  }
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
    case 'toggleDragSort':
      dragSortEnabled.value = !dragSortEnabled.value
      break
    case 'markBackground':
      showBackgroundColorDialog.value = true
      break
  }
}

// 处理用户操作命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      // 检查是否已登录
      if (!userInfo.value || !getToken()) {
        ElMessage.warning('请先登录后查看个人中心')
        pendingUserCenterOpen.value = true  // 设置待打开标志
        showLoginModal.value = true
        return
      }
      userCenterVisible.value = true
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
    currentTask.value = null
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

  // 筛选可见列，确保使用原始列定义的副本
  const filteredColumns = allColumns
    .filter(col => visibleColumns.value.includes(col.name))
    .map(col => ({ ...col })) // 创建副本，避免修改原始定义

  gantt.config.columns = filteredColumns
  console.log('过滤后的列:', filteredColumns.map(col => `${col.name}(${col.width}px)`))

  // 根据可见列数量动态调整Grid宽度
  adjustGridWidthByColumns(filteredColumns)

  // 重新渲染甘特图
  if (gantt && gantt.render) {
    gantt.render()
    console.log('甘特图已重新渲染')
  }
}


// 全选所有列
const selectAllColumns = () => {
  visibleColumns.value = allColumns.map(column => column.name)
}

// 选择核心列（任务名称、开始时间、结束时间）
const selectHalfColumns = () => {
  visibleColumns.value = ['id', 'text', 'start_date', 'end_date', 'owner', 'description']
}

// 全不选
const unselectAllColumns = () => {
  visibleColumns.value = []
}

// 检查收藏状态
const checkStarStatus = () => {
  if (!projectInfo.value?.id || !projectList.value || !userInfo.value) {
    isStarred.value = false
    return
  }

  // 检查当前项目是否在用户的项目列表中（已收藏的项目）
  const starProject = projectList.value.find(project =>
    (project.id === projectInfo.value.id || project.code === projectInfo.value.code) && (project.createUserId != userInfo.value.id)
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
    ElMessage.warning('这是个临时项目，不能Star')
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


//删除
const deleteProject = async () => {
  if (projectInfo.value == null || projectInfo.value.id == null) {
    ElMessage.warning('这是个临时项目，不能删除')
    return
  }
  ElMessageBox.confirm('确定删除该项目吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await del(projectInfo.value.id)
    ElMessage.success('删除成功')
    const newUrl = `${window.location.origin}${window.location.pathname}`
    window.history.replaceState({}, '', newUrl)
    window.location.reload()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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
  align-items: flex-start;
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
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  max-width: 300px;
  line-height: 1.4;
}

.editable-field .edit-icon {
  font-size: 12px;
  color: #c0c4cc;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-top: 2px;
  flex-shrink: 0;
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
  min-width: 300px;
  /* 设置最小宽度 */
  max-width: 500px;
  /* 设置最大宽度 */
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
  width: 120px;
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

/* 确保下拉菜单选项完整显示 */
.outlook-select .el-select-dropdown {
  min-width: 120px;
}

.outlook-select .el-select-dropdown__item {
  padding: 0 12px;
  white-space: nowrap;
}

/* 字段控制面板 */
.column-control-panel {
  padding: 16px;
  min-width: 220px;
}

.panel-header {
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 12px;
}

.panel-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 4px;
}

.panel-actions .el-button {
  padding: 6px;
  font-size: 16px;
  color: inherit;
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.panel-actions .el-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: #409eff;
  transform: scale(1.05);
}

.panel-actions .el-button.is-disabled {
  color: #c0c4cc;
}

.panel-actions .el-button.is-disabled:hover {
  color: #c0c4cc;
  background-color: transparent;
}

.panel-actions .reset-width-btn {
  color: #e6a23c;
}

.panel-actions .reset-width-btn:hover {
  color: #ebb563;
  background-color: rgba(230, 162, 60, 0.1);
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

/* 项目行背景 */
:deep(.gantt_project_row) {
  background: rgba(103, 194, 58, 0.05);
  font-weight: 600;
}

:deep(.gantt_custom_red) {
  background: #ffebee;
  font-weight: 600;
}

:deep(.gantt_custom_yellow) {
  background: #fffde7;
  font-weight: 600;
}

:deep(.gantt_custom_green) {
  background: #e8f5e8;
  font-weight: 600;
}

:deep(.gantt_custom_blue) {
  background: #e3f2fd;
  font-weight: 600;
}

/* 任务文本增强 */
:deep(.gantt_task_text) {
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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

/* 周末样式 - 时间轴列 */
:deep(.gantt_saturday) {
  background: rgba(255, 193, 7, 0.08) !important;
}

/* 周末样式 - 时间刻度头部 */
:deep(.gantt_scale_saturday) {
  background: linear-gradient(to bottom, #fff3cd, #ffeaa7) !important;
  color: #856404 !important;
  font-weight: 700;
}


/* 周末样式增强 - 任务背景区域 */
:deep(.gantt_task_bg.gantt_saturday) {
  background: repeating-linear-gradient(90deg,
      rgba(255, 193, 7, 0.05),
      rgba(255, 193, 7, 0.05) 99px,
      rgba(255, 193, 7, 0.15) 100px) !important;
}

/* Grid分割线拖拽手柄样式 */
:deep(.grid-resize-handle) {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 1000;
  transition: background-color 0.2s ease;
  border-right: 1px solid transparent;
}


:deep(.grid-resize-handle::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 20px;
  background-color: #dcdfe6;
  border-radius: 1px;
  transition: background-color 0.2s ease;
}

:deep(.grid-resize-handle:hover::before) {
  background-color: #409eff;
}

/* 拖拽时的视觉反馈 */
.gantt-container.grid-resizing {
  cursor: col-resize !important;
  user-select: none !important;
}

.gantt-container.grid-resizing * {
  cursor: col-resize !important;
}

.gantt-container.grid-resizing :deep(.gantt_grid) {
  border-right: 2px solid #409eff;
}

/* Grid最右边边框增强 */
:deep(.gantt_grid) {
  border-right: 1px solid #e4e7ed;
  transition: border-color 0.2s ease;
}

/* 拖拽排序样式 */
:deep(.gantt_row_drag) {
  background: rgba(64, 158, 255, 0.1);
  border: 1px dashed #409eff;
}

:deep(.gantt_row_drag_marker) {
  background: #409eff;
  height: 2px;
  border-radius: 1px;
}


/* 拖拽目标位置指示器 */
:deep(.gantt_drag_marker) {
  background: #409eff;
  height: 2px;
  border-radius: 1px;
  box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
}

/* 拖拽时的鼠标样式 */
:deep(.gantt_grid_data) {
  cursor: grab;
}

:deep(.gantt_grid_data:active) {
  cursor: grabbing;
}

/* 拖拽时禁用文本选择 */
:deep(.gantt_row_drag) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 拖拽时的行高亮 */
:deep(.gantt_row.gantt_row_drag) {
  background: rgba(64, 158, 255, 0.15);
  border-left: 3px solid #409eff;
  transition: all 0.2s ease;
}

/* 拖拽预览样式 */
:deep(.gantt_drag_marker) {
  background: linear-gradient(90deg, #409eff, #66b1ff);
  height: 3px;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  animation: dragMarkerPulse 1s infinite;
}

@keyframes dragMarkerPulse {

  0%,
  100% {
    opacity: 1;
    transform: scaleY(1);
  }

  50% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
}

/* 拖拽时的任务文本样式 */
:deep(.gantt_row_drag .gantt_cell) {
  color: #409eff;
  font-weight: 500;
}

/* 禁用拖拽时的样式 */
:deep(.gantt_grid_data.drag-disabled) {
  cursor: not-allowed;
}

:deep(.gantt_row.drag-disabled) {
  opacity: 0.6;
  pointer-events: none;
}


/* 个人中心对话框样式 */
.user-center-dialog {
  .el-dialog__body {
    padding: 0;
    max-height: 65vh;
    overflow: hidden;
  }

  .el-dialog {
    max-height: 75vh;
    overflow: hidden;
  }

  .el-dialog__header {
    padding: 16px 20px 12px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }
}

/* 背景色选择器样式 */
.background-color-selector {
  .current-task-info {
    margin-bottom: 20px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    .task-label {
      color: #606266;
      font-size: 14px;
      margin-right: 8px;
    }

    .task-name {
      color: #303133;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .color-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .color-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f7fa;
      transform: translateY(-2px);
    }

    .color-preview {
      width: 60px;
      height: 40px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      position: relative;
      transition: all 0.2s ease;

      .color-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .clear-icon {
        font-size: 20px;
        color: #909399;
      }
    }

    .color-name {
      font-size: 12px;
      color: #606266;
      font-weight: 500;
    }

    &:hover .color-preview {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>