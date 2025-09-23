<template>
    <div class="h5-container">
        <div class="h5-header">
            <img class="logo-icon" src="/favicon-32x32.png" alt="星甘" />
            <span class="app-name">星甘--致力于打造最简洁易用的进度管理工具</span>
        </div>

        <div class="action-buttons">
            <el-button size="large" class="action-btn" @click="goToDesktop">
                💻 请在PC端体验完整功能，移动端暂时展示进度分享
            </el-button>
        </div>

        <div class="h5-content">
            <!-- 项目信息卡片 -->
            <div class="project-info-card">
                <div class="project-header">
                    <div class="project-icon">📊</div>
                    <div class="project-details">
                        <h2 class="project-name">{{ projectInfo.name }}</h2>
                        <p class="project-description">{{ projectInfo.description }}</p>
                    </div>
                </div>
                <div class="project-stats">
                    <div class="stat-item">
                        <span class="stat-number">{{ tasks.length }}</span>
                        <span class="stat-label">任务总数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ completedTasksCount }}</span>
                        <span class="stat-label">已完成</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ progressPercentage }}%</span>
                        <span class="stat-label">总进度</span>
                    </div>
                </div>
            </div>

            <!-- 任务列表 -->
            <div class="tasks-section">
                <div class="section-header">
                    <h3 class="section-title">📋 任务列表</h3>
                    <span class="task-count">{{ tasks.length }} 个任务</span>
                </div>

                <div class="task-list">
                    <div v-for="task in tasks" :key="task.id" class="task-card" :class="getTaskStatusClass(task)">
                        <div class="task-header">
                            <div class="task-status-indicator" :class="getTaskStatusClass(task)"></div>
                            <h4 class="task-title">{{ task.text }}</h4>
                            <div class="task-progress-badge">{{ Math.round(task.progress * 100) }}%</div>
                        </div>

                        <div class="task-content">
                            <div class="task-info-row">
                                <div class="task-info-item">
                                    <span class="info-icon">📅</span>
                                    <span class="info-label">开始</span>
                                    <span class="info-value">{{ formatDate(task.start_date) }}</span>
                                </div>
                                <div class="task-info-item">
                                    <span class="info-icon">🏁</span>
                                    <span class="info-label">结束</span>
                                    <span class="info-value">{{ formatDate(calculateEndDate(task.start_date,
                                        task.duration)) }}</span>
                                </div>
                            </div>

                            <div class="task-info-row">
                                <div class="task-info-item">
                                    <span class="info-icon">⏱️</span>
                                    <span class="info-label">工期</span>
                                    <span class="info-value">{{ task.duration }} 天</span>
                                </div>
                                <div class="task-info-item" v-if="task.parent">
                                    <span class="info-icon">🔗</span>
                                    <span class="info-label">父任务</span>
                                    <span class="info-value">{{ getParentTaskName(task.parent) }}</span>
                                </div>
                            </div>

                            <!-- 进度条 -->
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: (task.progress * 100) + '%' }"
                                        :class="getProgressBarClass(task.progress)"></div>
                                </div>
                                <span class="progress-text">{{ Math.round(task.progress * 100) }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>

        <div class="h5-footer">
            <p>© 2025 StarGantt - 致力于打造最简洁易用的进度管理工具</p>
        </div>
    </div>
</template>

<script setup>
import {
    loadGanttData
} from '../services/ganttDataService.js'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import defaultData from '../data/gantt-data.json'

const tasks = ref([])
const projectInfo = ref({})

const router = useRouter()
const route = useRoute()

const goToDesktop = () => {
    // 保持当前的查询参数，并添加desktop标识
    const currentQuery = { ...route.query, desktop: 'true' }
    router.push({
        path: '/',
        query: currentQuery
    })
}

// 计算属性
const completedTasksCount = computed(() => {
    return tasks.value.filter(task => task.progress === 1.0).length
})

const progressPercentage = computed(() => {
    if (tasks.value.length === 0) return 0
    const totalProgress = tasks.value.reduce((sum, task) => sum + task.progress, 0)
    return Math.round((totalProgress / tasks.value.length) * 100)
})

// 方法
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

const getTaskStatusClass = (task) => {
    if (task.progress === 1.0) return 'completed'
    if (task.progress > 0) return 'in-progress'
    return 'not-started'
}

const getProgressBarClass = (progress) => {
    if (progress === 1.0) return 'completed'
    if (progress >= 0.7) return 'high-progress'
    if (progress >= 0.3) return 'medium-progress'
    return 'low-progress'
}

const getParentTaskName = (parentId) => {
    const parent = tasks.value.find(task => task.id === parentId)
    return parent ? parent.text : '-'
}

// 计算结束日期
const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return startDate
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + duration - 1)
    return end.toISOString().split('T')[0]
}

onMounted(async () => {
    const params = new URLSearchParams(window.location.search)
    let code = params.get('code')
    if (code == null) {
        tasks.value = defaultData.tasks
        projectInfo.value = {
            name: '默认项目',
            code: 'default',
            description: '默认项目',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
        }
        document.title = `${projectInfo.value.name} - 星甘`
    } else {
        const data = await loadGanttData(code);
        if (data == null) {
            ElMessage.error(`未能找到${code}对应的进度计划`)
            return;
        }
        tasks.value = data.tasks
        projectInfo.value = data.projectInfo
        document.title = `${projectInfo.value.name} - 星甘`
    }

})

</script>

<style scoped>
.h5-container {
    min-height: 100vh;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.h5-header {
    padding: 20px 16px 10px;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 16px;
}

.logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
}

.app-name {
    color: white;
    font-size: 16px;
    font-weight: 500;
    flex: 1;
}

.back-btn {
    color: white !important;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
}

.back-icon {
    transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
    transform: translateX(-3px);
}

.h5-title {
    font-size: 20px;
    font-weight: 600;
    flex: 1;
    text-align: center;
    margin-right: 80px;
    /* 平衡返回按钮的宽度 */
}

.h5-content {
    flex: 1;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* 项目信息卡片 */
.project-info-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 24px;
}

.project-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.project-icon {
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.project-details {
    flex: 1;
}

.project-name {
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin: 0 0 4px 0;
}

.project-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

.project-stats {
    display: flex;
    justify-content: space-around;
    gap: 16px;
}

.stat-item {
    text-align: center;
    flex: 1;
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #4ade80;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

/* 任务列表 */
.tasks-section {
    margin-bottom: 32px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin: 0;
}

.task-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.h5-content::-webkit-scrollbar,
.task-list::-webkit-scrollbar {
    width: 4px;
}

.h5-content::-webkit-scrollbar-track,
.task-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.h5-content::-webkit-scrollbar-thumb,
.task-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    transition: background 0.3s ease;
}

.h5-content::-webkit-scrollbar-thumb:hover,
.task-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* Firefox滚动条样式 */
.h5-content,
.task-list {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
}

.task-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.task-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.task-card.completed {
    border-left: 4px solid #10b981;
}

.task-card.in-progress {
    border-left: 4px solid #f59e0b;
}

.task-card.not-started {
    border-left: 4px solid #6b7280;
}

.task-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 0 16px;
}

.task-status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.task-status-indicator.completed {
    background: #10b981;
}

.task-status-indicator.in-progress {
    background: #f59e0b;
}

.task-status-indicator.not-started {
    background: #6b7280;
}

.task-title {
    font-size: 15px;
    font-weight: 500;
    color: white;
    margin: 0;
    flex: 1;
    line-height: 1.4;
}

.task-progress-badge {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
}

.task-content {
    padding: 12px 16px 16px 16px;
}

.task-info-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
}

.task-info-row:last-of-type {
    margin-bottom: 16px;
}

.task-info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

.info-icon {
    font-size: 12px;
    flex-shrink: 0;
}

.info-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
}

.info-value {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
}

.progress-fill.completed {
    background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.high-progress {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.progress-fill.medium-progress {
    background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.low-progress {
    background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    min-width: 32px;
    text-align: right;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
}

.mobile-tip {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.action-btn.el-button--primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    border: none;
}

.action-btn.el-button--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
}

.action-btn:not(.el-button--primary) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
}

.action-btn:not(.el-button--primary):hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.h5-footer {
    padding: 24px 16px;
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.h5-footer p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

/* 移动端适配 */
@media (max-width: 768px) {
    .h5-header {
        padding: 16px 12px 8px;
    }

    .app-name {
        font-size: 14px;
    }

    .h5-content {
        padding: 24px 12px;
    }

    .project-info-card {
        padding: 16px;
    }

    .project-icon {
        width: 40px;
        height: 40px;
        font-size: 28px;
    }

    .project-name {
        font-size: 16px;
    }

    .project-description {
        font-size: 12px;
    }

    .stat-number {
        font-size: 20px;
    }

    .task-header {
        padding: 12px 12px 0 12px;
    }

    .task-content {
        padding: 10px 12px 12px 12px;
    }

    .task-title {
        font-size: 14px;
    }

    .task-info-row {
        gap: 12px;
    }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
    .h5-header {
        padding: 12px 8px 6px;
    }

    .logo-icon {
        width: 28px;
        height: 28px;
    }

    .app-name {
        font-size: 13px;
    }

    .h5-content {
        padding: 20px 8px;
        gap: 20px;
    }

    .project-info-card {
        padding: 14px;
    }

    .project-header {
        gap: 12px;
        margin-bottom: 16px;
    }

    .project-icon {
        width: 36px;
        height: 36px;
        font-size: 24px;
    }

    .project-name {
        font-size: 15px;
    }

    .stat-number {
        font-size: 18px;
    }

    .section-title {
        font-size: 16px;
    }

    .task-list {
        gap: 10px;
    }

    .task-header {
        padding: 10px 10px 0 10px;
        gap: 10px;
    }

    .task-content {
        padding: 8px 10px 10px 10px;
    }

    .task-title {
        font-size: 13px;
    }

    .task-info-row {
        gap: 8px;
        margin-bottom: 10px;
    }

    .task-info-row:last-of-type {
        margin-bottom: 12px;
    }

    .action-buttons {
        margin-top: 24px;
        gap: 12px;
    }

    .action-btn {
        height: 44px;
        font-size: 15px;
    }
}
</style>