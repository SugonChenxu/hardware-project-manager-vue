<template>
    <el-dialog v-model="dialogVisible" title="" width="1100px" :close-on-click-modal="true" class="history-dialog"
        :show-close="true" @close="handleClose">

        <div class="dialog-body">
            <!-- 左侧：历史记录列表 -->
            <div class="history-content" v-loading="loading">
                <template v-if="historyList.length > 0">
                    <div class="history-list">
                        <div v-for="(item, index) in historyList" :key="item.id" class="history-item"
                            :class="{ 'selected': selectedItem?.id === item.id }" @click="selectVersion(item)">
                            <div class="item-left">
                                <div class="timeline-dot" :class="{ 'active': selectedItem?.id === item.id }"></div>
                                <div class="timeline-line" v-if="index < historyList.length - 1"></div>
                            </div>
                            <div class="item-content">
                                <div class="item-header">
                                    <div class="version-info">
                                        <span class="version-time">{{ formatTime(item.createTime) + ' ' + item.createUserName }}</span>
                                    </div>
                                    <el-button type="primary" link size="small" class="restore-btn" 
                                        @click.stop="handleRestore(item)">恢复</el-button>
                                </div>
                                <div class="item-details">
                                    <span class="detail-name" v-if="item.name">{{ item.name }}</span>
                                    <span class="detail-divider">/</span>
                                    <span class="detail-name">{{ item.code }}</span>
                                </div>
                                <div class="item-desc" v-if="item.description">{{ item.description }}</div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else-if="!loading">
                    <div class="empty-state">
                        <svg class="empty-icon" viewBox="0 0 1024 1024" width="64" height="64">
                            <path
                                d="M864 144H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16z m-52 268H612V212h200v200zM464 544H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16z m-52 268H212V612h200v200z"
                                fill="#d9d9d9" />
                            <path
                                d="M464 144H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16z m-52 268H212V212h200v200z"
                                fill="#d9d9d9" />
                            <path
                                d="M864 544H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16z m-52 268H612V612h200v200z"
                                fill="#d9d9d9" />
                        </svg>
                        <p class="empty-text">暂无修订记录</p>
                        <p class="empty-desc">保存项目后会自动生成修订记录</p>
                    </div>
                </template>
            </div>

            <!-- 右侧：任务预览表格 -->
            <div class="preview-panel">
                <div class="preview-header">
                    <span class="preview-title" v-if="selectedItem">{{ selectedItem?.name }} / {{ selectedItem?.code }}</span>
                    <span class="preview-count" v-if="previewTasks.length > 0">{{ previewTasks.length }} 项任务</span>
                </div>
                <div class="preview-content" v-if="selectedItem">
                    <el-table :data="previewTasks" border size="small" max-height="400" 
                        empty-text="暂无任务数据">
                        <el-table-column prop="text" label="任务名称" min-width="160" show-overflow-tooltip>
                            <template #default="{ row }">
                                <span :style="{ paddingLeft: (row.$level || 0) * 16 + 'px' }">
                                    {{ getTypeIcon(row.type) }} {{ row.text }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="start_date" label="开始日期" width="90" align="center">
                            <template #default="{ row }">
                                {{ formatDate(row.start_date) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="end_date" label="结束日期" width="90">
                            <template #default="{ row }">
                                {{ formatDate(row.end_date) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="duration" label="工期" width="50">
                            <template #default="{ row }">
                                {{ row.duration || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="progress" label="进度" width="50" >
                            <template #default="{ row }">
                                <span class="progress-text">{{ formatProgress(row.progress) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="描述" width="120" show-overflow-tooltip>
                            <template #default="{ row }">
                                {{ row.description || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="owner" label="负责人" width="80" show-overflow-tooltip>
                            <template #default="{ row }">
                                {{ row.owner || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag :type="getStatusType(row.status)" size="small">
                                    {{ getStatusText(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="preview-empty" v-else>
                    <svg class="preview-empty-icon" viewBox="0 0 1024 1024" width="48" height="48">
                        <path d="M512 128c212.1 0 384 171.9 384 384s-171.9 384-384 384-384-171.9-384-384 171.9-384 384-384m0-64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z" fill="#d9d9d9"/>
                        <path d="M512 640c-17.7 0-32-14.3-32-32V320c0-17.7 14.3-32 32-32s32 14.3 32 32v288c0 17.7-14.3 32-32 32zM512 736a48 48 0 1 0 0-96 48 48 0 0 0 0 96z" fill="#d9d9d9"/>
                    </svg>
                    <p class="preview-empty-text">点击左侧版本查看任务详情</p>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { loadByProjId } from '../api/sysproject.js'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    projectId: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'restore'])

const dialogVisible = ref(props.modelValue)
const loading = ref(false)
const historyList = ref([])
const selectedItem = ref(null)

// 状态映射
const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'not_started': '未开始',
    'on_hold': '已暂停',
    'cancelled': '已取消'
}

// 状态类型映射
const statusTypeMap = {
    'completed': 'success',
    'in_progress': 'primary',
    'not_started': 'info',
    'on_hold': 'warning',
    'cancelled': 'danger'
}

// 计算预览任务列表
const previewTasks = computed(() => {
    if (!selectedItem.value?.content) return []
    try {
        const content = typeof selectedItem.value.content === 'string' 
            ? JSON.parse(selectedItem.value.content) 
            : selectedItem.value.content
        const tasks = content?.tasks || []
        // 按 $index 排序
        return tasks.slice().sort((a, b) => {
            const indexA = a.$index !== undefined ? a.$index : Infinity
            const indexB = b.$index !== undefined ? b.$index : Infinity
            return indexA - indexB
        })
    } catch (e) {
        return []
    }
})

// 监听props变化
watch(() => props.modelValue, (newVal) => {
    dialogVisible.value = newVal
    if (newVal && props.projectId) {
        loadHistory()
    }
})

// 监听内部状态变化
watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
    if (!newVal) {
        selectedItem.value = null
    }
})

// 加载历史记录
const loadHistory = async () => {
    if (!props.projectId) {
        historyList.value = []
        return
    }

    loading.value = true
    selectedItem.value = null
    try {
        const res = await loadByProjId({ projId: props.projectId })
        historyList.value = res.data || []
        // 默认选中第一项
        if (historyList.value.length > 0) {
            selectedItem.value = historyList.value[0]
        }
    } catch (error) {
        historyList.value = []
    } finally {
        loading.value = false
    }
}

// 格式化时间
const formatTime = (time) => {
    if (!time) return ''
    const date = dayjs(time)
    const now = dayjs()

    // 如果是今天
    if (date.isSame(now, 'day')) {
        return date.format('HH:mm:ss')
    }
    // 如果是昨天
    if (date.isSame(now.subtract(1, 'day'), 'day')) {
        return '昨天 ' + date.format('HH:mm')
    }
    // 如果是今年
    if (date.isSame(now, 'year')) {
        return date.format('MM-DD HH:mm')
    }
    // 其他
    return date.format('YYYY-MM-DD HH:mm')
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return '-'
    return dayjs(date).format('YYYY-MM-DD')
}

// 格式化进度
const formatProgress = (progress) => {
    if (progress === undefined || progress === null) return '-'
    return `${Math.round(progress * 100)}%`
}

// 获取状态文本
const getStatusText = (status) => {
    return statusMap[status] || '未开始'
}

// 获取状态类型
const getStatusType = (status) => {
    return statusTypeMap[status] || 'info'
}

// 获取任务类型图标
const getTypeIcon = (type) => {
    const icons = {
        'task': '📋',
        'project': '📁',
        'milestone': '🎯'
    }
    return icons[type] || '📋'
}

// 选择版本
const selectVersion = (item) => {
    selectedItem.value = item
}

// 恢复版本
const handleRestore = (item) => {
    ElMessageBox.confirm(
        `确定要恢复到${item.createTime}版本吗？当前内容将被覆盖。`,
        '恢复版本',
        {
            confirmButtonText: '确定恢复',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        emit('restore', item)
        dialogVisible.value = false
    }).catch(() => { })
}

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}

// 暴露方法
defineExpose({
    open: () => {
        dialogVisible.value = true
        if (props.projectId) {
            loadHistory()
        }
    },
    close: () => {
        dialogVisible.value = false
    },
    refresh: loadHistory
})
</script>

<style scoped>
.history-dialog :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
}

.history-dialog :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
}

.history-dialog :deep(.el-dialog__body) {
    padding: 0;
}

.history-dialog :deep(.el-dialog__headerbtn) {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 14px;
}

.dialog-body {
    display: flex;
    min-height: 420px;
}

.history-header {
    padding: 16px 20px 0;
    border-bottom: 1px solid #f0f0f0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.history-icon {
    color: #409eff;
}

.header-tabs {
    display: flex;
    gap: 24px;
}

.header-tabs .tab {
    padding: 8px 0;
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
}

.header-tabs .tab:hover {
    color: #606266;
}

.header-tabs .tab.active {
    color: #409eff;
    font-weight: 500;
}

.header-tabs .tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #409eff;
    border-radius: 1px;
}

.history-content {
    width: 320px;
    flex-shrink: 0;
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid #f0f0f0;
}

.history-list {
    padding: 12px 12px;
}

.history-item {
    display: flex;
    cursor: pointer;
    transition: all 0.15s ease;
}

.history-item:hover .item-content {
    background-color: #f8f9fb;
}

.history-item.current .item-content {
    background-color: #f0f7ff;
    border-color: #409eff;
}

.history-item.selected .item-content {
    background-color: #ecf5ff;
    border-color: #409eff;
}

.history-item.selected .timeline-dot {
    background: #409eff;
    box-shadow: 0 0 0 1px #409eff, 0 0 0 4px rgba(64, 158, 255, 0.15);
}

/* 左侧时间线 */
.item-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20px;
    flex-shrink: 0;
    padding-top: 10px;
}

.timeline-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #dcdfe6;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #dcdfe6;
    z-index: 1;
}

.timeline-dot.active {
    background: #409eff;
    box-shadow: 0 0 0 1px #409eff, 0 0 0 4px rgba(64, 158, 255, 0.15);
}

.timeline-line {
    width: 1px;
    flex: 1;
    background: #e4e7ed;
    margin-top: 4px;
}

/* 右侧内容 */
.item-content {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    margin-left: 8px;
    margin-bottom: 4px;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.15s ease;
}

.item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.version-info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.version-time {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
}

.version-badge {
    display: inline-block;
    padding: 0 5px;
    font-size: 10px;
    color: #fff;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    border-radius: 3px;
    line-height: 16px;
}

.restore-btn {
    font-size: 12px;
    padding: 2px 8px;
    opacity: 0;
    transition: opacity 0.15s;
}

.history-item:hover .restore-btn {
    opacity: 1;
}

.history-item.selected .restore-btn {
    opacity: 1;
}

.item-details {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    overflow: hidden;
}

.detail-user {
    color: #606266;
}

.detail-divider {
    color: #dcdfe6;
}

.detail-name {
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-desc {
    margin-top: 4px;
    font-size: 11px;
    color: #a8abb2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
}

.empty-icon {
    margin-bottom: 16px;
    opacity: 0.6;
}

.empty-text {
    font-size: 14px;
    color: #606266;
    margin: 0 0 8px;
}

.empty-desc {
    font-size: 12px;
    color: #909399;
    margin: 0;
}

/* 滚动条样式 */
.history-content::-webkit-scrollbar {
    width: 6px;
}

.history-content::-webkit-scrollbar-track {
    background: transparent;
}

.history-content::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
}

.history-content::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
}

/* 预览面板样式 */
.preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
}

.preview-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
}

.preview-count {
    font-size: 12px;
    color: #909399;
    background: #f0f0f0;
    padding: 2px 8px;
    border-radius: 10px;
}

.preview-content {
    flex: 1;
    padding: 12px;
    overflow: hidden;
}

.preview-content :deep(.el-table) {
    font-size: 12px;
}

.preview-content :deep(.el-table th) {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #606266;
    padding: 6px 0;
}

.preview-content :deep(.el-table td) {
    padding: 4px 0;
}


.preview-content :deep(.el-tag) {
    padding: 0 6px;
    height: 20px;
    line-height: 18px;
}

.progress-text {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 11px;
}

.preview-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
}

.preview-empty-icon {
    margin-bottom: 12px;
    opacity: 0.6;
}

.preview-empty-text {
    font-size: 13px;
    color: #a8abb2;
    margin: 0;
}
</style>
