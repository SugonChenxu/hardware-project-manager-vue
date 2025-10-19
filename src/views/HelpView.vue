<template>
    <div class="help-page">
        <!-- 顶部导航 -->
        <div class="help-header">
            <div class="header-content">
                <div class="brand-section">
                    <img class="logo-icon" src="/favicon-32x32.png" alt="星甘" />
                    <h1 class="app-title">星甘 - 操作指南</h1>
                </div>
                <el-button class="back-btn" @click="goBack" type="primary" size="small">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    返回甘特图
                </el-button>
            </div>
        </div>

        <!-- 主体内容 -->
        <div class="help-main">
            <!-- 左侧导航目录 -->
            <div class="help-sidebar">
                <div class="sidebar-content">
                    <h3 class="sidebar-title">📋 操作指南</h3>
                    <div class="nav-menu">
                        <div class="nav-item" :class="{ active: currentSection === 'video' }"
                            @click="scrollToSection('video')">
                            <span class="nav-icon">🎥</span>
                            <span class="nav-text">视频教程</span>
                        </div>
                        <div class="nav-item" :class="{ active: currentSection === 'core-operations' }"
                            @click="scrollToSection('core-operations')">
                            <span class="nav-icon">⚡</span>
                            <span class="nav-text">操作说明</span>
                        </div>
                        <div class="nav-sub-items" v-show="currentSection === 'core-operations'">
                            <div class="nav-sub-item" @click="scrollToSection('double-click')">双击编辑</div>
                            <div class="nav-sub-item" @click="scrollToSection('drag-sort')">拖拽排序</div>
                            <div class="nav-sub-item" @click="scrollToSection('change-color')">标记背景色</div>
                            <div class="nav-sub-item" @click="scrollToSection('resize-table')">调整宽度</div>
                        </div>


                        <div class="nav-item" :class="{ active: currentSection === 'shortcuts' }"
                            @click="scrollToSection('shortcuts')">
                            <span class="nav-icon">⌨️</span>
                            <span class="nav-text">快捷键</span>
                        </div>

                        <div class="nav-item" :class="{ active: currentSection === 'support' }"
                            @click="scrollToSection('support')">
                            <span class="nav-icon">📞</span>
                            <span class="nav-text">获取帮助</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧内容区域 -->
            <div class="help-content">
                <div class="content-container">
                    <!-- 视频 -->
                    <div id="video" class="content-section">
                        <h2 class="section-title">🎥 视频教程</h2>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <iframe width="100%" height="400"
                                    src="//player.bilibili.com/player.html?isOutside=true&aid=115274992918453&bvid=BV1BenJzWEXq&cid=32669106525&p=1"
                                    scrolling="no" border="0" frameborder="no" framespacing="0"
                                    allowfullscreen="true"></iframe>
                            </div>
                        </div>
                    </div>

                    <!-- 核心操作 -->
                    <div id="core-operations" class="content-section">
                        <h2 class="section-title">⚡ 操作说明</h2>

                        <!-- 双击任务行弹出详细修改 -->
                        <div id="double-click" class="operation-card">
                            <div class="operation-header">
                                <div class="operation-icon">🖱️</div>
                                <h3>双击弹出详细修改</h3>
                            </div>
                            <p class="operation-desc">双击任务行可以打开详细编辑对话框，完善任务信息且可删除任务。</p>
                            <div class="steps-container">
                                <img class="operation-image" src="http://img.openauth.net.cn/2025-09-26-14-39-37.png"
                                    alt="双击任务行弹出详细修改" />
                            </div>
                            <div class="tip-card">
                                <el-icon class="tip-icon">
                                    <InfoFilled />
                                </el-icon>
                                <span>💡 小贴士：也可以直接单击单元格进行快速内联编辑</span>
                            </div>
                        </div>

                        <!-- 拖拽排序 -->
                        <div id="drag-sort" class="operation-card">
                            <div class="operation-header">
                                <div class="operation-icon">🔄</div>
                                <h3>拖拽排序</h3>
                            </div>
                            <p class="operation-desc">通过拖拽调整任务顺序，优化项目计划安排。</p>
                            <div class="image-container">
                                <img class="operation-image" src="http://img.openauth.net.cn/2025-09-26-14-46-54.png"
                                    alt="拖拽排序" />
                            </div>
                            <div class="steps-container">
                                <div class="step-item">
                                    <span class="step-num">1</span>
                                    <span>确保拖拽排序功能已启用（工具栏 > 更多 > 启用拖拽排序）</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">2</span>
                                    <span>鼠标按住任务行并拖动</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">3</span>
                                    <span>拖动到目标位置，松开鼠标完成排序</span>
                                </div>
                            </div>
                            <div class="tip-card">
                                <el-icon class="tip-icon">
                                    <InfoFilled />
                                </el-icon>
                                <span>💡 小贴士：支持同级排序和跨级调整，里程碑任务有特殊限制</span>
                            </div>
                        </div>

                        <!-- 标记背景色 -->
                        <div id="change-color" class="operation-card">
                            <div class="operation-header">
                                <div class="operation-icon">🎨</div>
                                <h3>标记背景色</h3>
                            </div>
                            <p class="operation-desc">针对选中的任务，可以标记背景色，以便与其他任务进行区分</p>
                            <div class="steps-container">
                                <img class="operation-image" src="http://img.openauth.net.cn/2025-10-19-14-30-09.png"
                                    alt="标记背景色" />
                            </div>
                            <div class="tip-card">
                                <el-icon class="tip-icon">
                                    <InfoFilled />
                                </el-icon>
                                <span>💡 小贴士：点击任务行或甘特图区域，右键选择“标记背景色”</span>
                            </div>
                        </div>

                        <!-- 拖拽调整表格宽度 -->
                        <div id="resize-table" class="operation-card">
                            <div class="operation-header">
                                <div class="operation-icon">↔️</div>
                                <h3>拖拽调整表格与甘特图宽度</h3>
                            </div>
                            <p class="operation-desc">拖拽调整表格与甘特图宽度，优化显示效果。</p>
                            <div class="image-container">
                                <img class="operation-image" src="http://img.openauth.net.cn/2025-09-26-23-36-01.png"
                                    alt="拖拽调整表格宽度" />
                            </div>
                            <div class="steps-container">
                                <div class="step-item">
                                    <span class="step-num">1</span>
                                    <span>找到表格区域右边缘的分割线</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">2</span>
                                    <span>鼠标悬停，光标变为调整状态（↔️）</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">3</span>
                                    <span>按住鼠标左键左右拖动，松开鼠标，宽度设置自动保存</span>
                                </div>
                            </div>
                            <div class="tip-card">
                                <el-icon class="tip-icon">
                                    <InfoFilled />
                                </el-icon>
                                <span>💡 小贴士：可在字段控制面板点击"重置表格宽度"恢复默认</span>
                            </div>
                        </div>
                    </div>

                    <!-- 快捷键 -->
                    <div id="shortcuts" class="content-section">
                        <h2 class="section-title">⌨️ 快捷键</h2>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Ctrl+Q</kbd>
                                <span>新建任务</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl + S</kbd>
                                <span>保存项目</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl + Z</kbd>
                                <span>撤销</span>
                            </div>
                        </div>
                    </div>

                    <!-- 获取帮助 -->
                    <div id="support" class="content-section">
                        <h2 class="section-title">📞 获取帮助</h2>
                        <p class="support-desc">如果您在使用过程中遇到问题，可以通过以下方式获取帮助：</p>
                        <div class="support-methods">
                            <div class="support-card" @click="showContactService">
                                <el-icon class="support-icon">
                                    <ChatDotSquare />
                                </el-icon>
                                <div class="support-info">
                                    <h4>在线客服</h4>
                                    <p>点击此处查看客服微信二维码</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 客服对话框 -->
        <ContactServiceDialog v-model="showContactDialog" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, InfoFilled, ChatDotSquare, Document } from '@element-plus/icons-vue'
import ContactServiceDialog from '@/components/ContactServiceDialog.vue'

const router = useRouter()
const currentSection = ref('video')
const showContactDialog = ref(false)

const goBack = () => {
    router.push('/')
}

const scrollToSection = (sectionId) => {
    currentSection.value = sectionId
    const element = document.getElementById(sectionId)
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }
}

const showContactService = () => {
    showContactDialog.value = true
}

// 监听滚动，更新当前激活的导航项
const handleScroll = () => {
    const sections = ['core-operations', 'features', 'shortcuts', 'support']
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

    for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop - 100 <= scrollTop) {
            currentSection.value = sections[i]
            break
        }
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.help-page {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
}

/* 顶部导航 */
.help-header {
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-icon {
    width: 28px;
    height: 28px;
}

.app-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.back-btn {
    gap: 4px;
    padding: 6px 12px;
}

/* 主体布局 */
.help-main {
    display: flex;
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    gap: 0;
}

/* 左侧导航 */
.help-sidebar {
    width: 240px;
    background: #ffffff;
    border-right: 1px solid #e1e8ed;
    flex-shrink: 0;
    position: sticky;
    top: 65px;
    height: calc(100vh - 65px);
    overflow-y: auto;
}

.sidebar-content {
    padding: 20px 16px;
}

.sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1e8ed;
}

.nav-menu {
    display: flex;
    flex-direction: column;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;
    color: #5a6c7d;
}

.nav-item:hover {
    background: #f0f2f5;
    color: #409eff;
}

.nav-item.active {
    background: #e7f3ff;
    color: #409eff;
    font-weight: 500;
}

.nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
}

.nav-text {
    font-size: 14px;
}

.nav-sub-items {
    margin-left: 28px;
    padding: 4px 0;
}

.nav-sub-item {
    padding: 6px 8px;
    font-size: 13px;
    color: #6c757d;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 2px;
    transition: all 0.2s ease;
}

.nav-sub-item:hover {
    background: #f0f2f5;
    color: #409eff;
}

/* 右侧内容区域 */
.help-content {
    flex: 1;
    background: #ffffff;
    min-height: calc(100vh - 65px);
}

.content-container {
    padding: 20px 24px;
    max-width: 800px;
}

.content-section {
    margin-bottom: 32px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1e8ed;
}

/* 操作卡片 */
.operation-card {
    background: #fafbfc;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.operation-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.operation-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
}

.operation-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.operation-desc {
    font-size: 14px;
    color: #5a6c7d;
    margin-bottom: 12px;
    line-height: 1.5;
}

/* 步骤容器 */
.steps-container {
    margin-bottom: 12px;
}

/* 图片容器 */
.image-container {
    margin: 12px 0;
    text-align: center;
}

/* 操作演示图片 */
.operation-image {
    max-width: 100%;
    width: auto;
    height: auto;
    max-height: 400px;
    border: 1px solid #e1e8ed;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #fff;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    padding: 8px;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    font-size: 13px;
}

.step-num {
    background: #409eff;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
}

/* 提示卡片 */
.tip-card {
    background: #e7f3ff;
    border: 1px solid #b3d8ff;
    border-radius: 6px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #0066cc;
    font-size: 13px;
}

.tip-icon {
    color: #409eff;
    flex-shrink: 0;
    font-size: 16px;
}

/* 功能网格 */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.feature-card {
    background: #fafbfc;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    transition: all 0.2s ease;
}

.feature-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
}

.feature-card h4 {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
}

.feature-card p {
    font-size: 12px;
    color: #6c757d;
    margin: 0;
    line-height: 1.4;
}

/* 快捷键列表 */
.shortcut-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
}

.shortcut-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #fafbfc;
    border: 1px solid #e1e8ed;
    border-radius: 6px;
    font-size: 13px;
}

kbd {
    background: #2c3e50;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    min-width: 28px;
    text-align: center;
}

/* 支持信息 */
.support-desc {
    font-size: 14px;
    color: #5a6c7d;
    margin-bottom: 16px;
    line-height: 1.5;
}

.support-methods {
    display: grid;
    gap: 12px;
}

.support-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fafbfc;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.support-card:hover {
    background: #f0f2f5;
    border-color: #409eff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.support-icon {
    color: #409eff;
    font-size: 20px;
    flex-shrink: 0;
}

.support-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 2px 0;
}

.support-info p {
    font-size: 13px;
    color: #6c757d;
    margin: 0;
    line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 968px) {
    .help-main {
        flex-direction: column;
    }

    .help-sidebar {
        width: 100%;
        position: relative;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e1e8ed;
    }

    .sidebar-content {
        padding: 16px;
    }

    .nav-menu {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
    }

    .nav-item {
        margin-bottom: 0;
        white-space: nowrap;
    }

    .nav-sub-items {
        display: none;
    }

    .content-container {
        padding: 16px 20px;
    }
}

@media (max-width: 576px) {
    .header-content {
        padding: 8px 12px;
    }

    .app-title {
        font-size: 16px;
    }

    .content-container {
        padding: 12px 16px;
    }

    .feature-grid {
        grid-template-columns: 1fr;
    }

    .shortcut-list {
        grid-template-columns: 1fr;
    }

    .nav-menu {
        flex-direction: column;
    }
}
</style>
