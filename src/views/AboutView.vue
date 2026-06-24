<template>
    <div class="about-page">
        <!-- 顶部导航 -->
        <header class="about-header">
            <div class="header-content">
                <div class="brand-section" @click="goHome">
                    <img class="logo-icon" src="/favicon-32x32.png" alt="星甘 StarGantt 在线甘特图" />
                    <h1 class="app-title">星甘 StarGantt</h1>
                </div>
                <nav class="nav-links">
                    <a href="#features" class="nav-link">功能特点</a>
                    <a href="#scenarios" class="nav-link">应用场景</a>
                    <a href="#faq" class="nav-link">常见问题</a>
                    <el-button class="try-btn" @click="goHome" type="primary">
                        立即使用
                        <el-icon class="ml-1"><ArrowRight /></el-icon>
                    </el-button>
                </nav>
            </div>
        </header>

        <!-- Hero区域 -->
        <section class="hero-section">
            <div class="hero-content">
                <div class="hero-badge">🚀 免费开源 · 无需下载</div>
                <h1 class="hero-title">
                    <span class="highlight">在线甘特图</span>制作工具
                </h1>
                <h2 class="hero-subtitle">专业项目进度管理，让计划一目了然</h2>
                <p class="hero-desc">
                    星甘 StarGantt 是一款免费开源的<strong>在线甘特图</strong>制作平台，无需下载安装，
                    打开浏览器即可创建专业的<strong>项目甘特图</strong>。支持任务分解、依赖关系、
                    基线对比、Excel导出等完整功能，是团队项目管理的理想选择。
                </p>
                <div class="hero-actions">
                    <el-button class="action-btn primary" size="large" @click="goHome">
                        <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        免费创建甘特图
                    </el-button>
                    <el-button class="action-btn secondary" size="large" @click="goHelp">
                        <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                        </svg>
                        查看使用教程
                    </el-button>
                </div>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-num">10,000+</span>
                        <span class="stat-label">活跃用户</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-num">50,000+</span>
                        <span class="stat-label">创建项目</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-num">100%</span>
                        <span class="stat-label">免费使用</span>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="visual-card">
                    <img src="/main.png" alt="星甘在线甘特图工具界面截图" class="screenshot-img" />
                </div>
            </div>
        </section>

        <!-- 什么是甘特图 -->
        <section class="intro-section">
            <div class="section-container">
                <h2 class="section-title">什么是甘特图？</h2>
                <div class="intro-content">
                    <div class="intro-text">
                        <p>
                            <strong>甘特图</strong>（Gantt Chart）是一种广泛应用于项目管理的图表工具，
                            由亨利·甘特于20世纪初发明。它以图形方式直观展示项目任务的时间安排：
                            <strong>横轴代表时间线，纵轴列出任务名称</strong>，通过条形图显示每个任务的
                            开始时间、持续时间和结束时间。
                        </p>
                        <p>
                            甘特图的核心价值在于让项目进度<strong>一目了然</strong>。项目经理可以清晰地
                            看到哪些任务正在进行、哪些已完成、哪些存在延期风险，从而及时调整资源分配，
                            确保项目按时交付。
                        </p>
                        <div class="intro-highlights">
                            <div class="highlight-item">
                                <span class="highlight-icon">📊</span>
                                <span>直观展示项目进度</span>
                            </div>
                            <div class="highlight-item">
                                <span class="highlight-icon">🔗</span>
                                <span>明确任务依赖关系</span>
                            </div>
                            <div class="highlight-item">
                                <span class="highlight-icon">⏰</span>
                                <span>精确把控时间节点</span>
                            </div>
                            <div class="highlight-item">
                                <span class="highlight-icon">👥</span>
                                <span>优化资源配置</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 功能特点 -->
        <section id="features" class="features-section">
            <div class="section-container">
                <h2 class="section-title">星甘甘特图核心功能</h2>
                <p class="section-desc">专业级在线甘特图工具，覆盖项目管理全流程</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">🎯</span>
                        </div>
                        <h3>任务管理</h3>
                        <p>支持普通任务、项目组、里程碑三种类型，轻松构建WBS工作分解结构</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">🔗</span>
                        </div>
                        <h3>依赖关系</h3>
                        <p>设置任务间的前置后置关系，自动计算影响路径，确保项目逻辑清晰</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">📏</span>
                        </div>
                        <h3>基线对比</h3>
                        <p>设置项目基准计划，实时对比计划与实际进度，及时发现偏差并调整</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">📤</span>
                        </div>
                        <h3>Excel导出</h3>
                        <p>一键导出带甘特图的Excel报表，方便汇报和存档，支持多种格式</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">⚡</span>
                        </div>
                        <h3>级联更新</h3>
                        <p>调整任务时间时自动更新关联任务，保持项目计划的整体一致性</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">🎨</span>
                        </div>
                        <h3>任务标记</h3>
                        <p>自定义任务背景色，通过颜色区分任务优先级或状态，一目了然</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">📋</span>
                        </div>
                        <h3>项目复制</h3>
                        <p>一键复制已有项目，快速创建类似项目计划，提高工作效率</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon-wrap">
                            <span class="feature-icon">☁️</span>
                        </div>
                        <h3>云端存储</h3>
                        <p>项目数据云端保存，随时随地访问，支持多设备同步</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 使用场景 -->
        <section id="scenarios" class="scenarios-section">
            <div class="section-container">
                <h2 class="section-title">甘特图应用场景</h2>
                <p class="section-desc">无论您是项目经理、工程师还是个人用户，星甘都能满足您的需求</p>
                
                <div class="scenarios-grid">
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">🏗️</span>
                            <h3>工程项目管理</h3>
                        </div>
                        <p>建筑施工、装修工程、基础设施建设等项目的进度排期和资源调配</p>
                        <ul class="scenario-list">
                            <li>施工进度表制作</li>
                            <li>材料进场计划</li>
                            <li>多工种协调安排</li>
                        </ul>
                    </div>
                    
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">💻</span>
                            <h3>软件研发管理</h3>
                        </div>
                        <p>软件开发、产品迭代、版本发布等研发项目的进度追踪</p>
                        <ul class="scenario-list">
                            <li>Sprint迭代计划</li>
                            <li>版本发布排期</li>
                            <li>需求开发跟踪</li>
                        </ul>
                    </div>
                    
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">📈</span>
                            <h3>市场营销活动</h3>
                        </div>
                        <p>营销活动策划、品牌推广、展会活动等市场工作的时间规划</p>
                        <ul class="scenario-list">
                            <li>营销活动排期</li>
                            <li>媒体投放计划</li>
                            <li>内容发布日历</li>
                        </ul>
                    </div>
                    
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">🎓</span>
                            <h3>学术研究项目</h3>
                        </div>
                        <p>科研课题、论文写作、学位论文等学术项目的进度管理</p>
                        <ul class="scenario-list">
                            <li>课题研究计划</li>
                            <li>论文写作进度</li>
                            <li>实验安排表</li>
                        </ul>
                    </div>
                    
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">🏢</span>
                            <h3>企业运营管理</h3>
                        </div>
                        <p>年度计划、部门目标、流程优化等企业管理工作的进度把控</p>
                        <ul class="scenario-list">
                            <li>年度工作计划</li>
                            <li>OKR目标跟踪</li>
                            <li>项目里程碑</li>
                        </ul>
                    </div>
                    
                    <div class="scenario-card">
                        <div class="scenario-header">
                            <span class="scenario-icon">👤</span>
                            <h3>个人时间管理</h3>
                        </div>
                        <p>个人学习计划、生活安排、自我提升等个人事务的时间规划</p>
                        <ul class="scenario-list">
                            <li>学习计划安排</li>
                            <li>考试备考规划</li>
                            <li>个人目标追踪</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- 如何制作甘特图 -->
        <section class="howto-section">
            <div class="section-container">
                <h2 class="section-title">甘特图怎么做？</h2>
                <p class="section-desc">使用星甘，只需4步即可创建专业的项目甘特图</p>
                
                <div class="steps-container">
                    <div class="step-card">
                        <div class="step-num">1</div>
                        <h3>创建项目</h3>
                        <p>打开星甘在线甘特图工具，创建新项目并设置项目名称和基本信息</p>
                    </div>
                    
                    <div class="step-arrow">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
                        </svg>
                    </div>
                    
                    <div class="step-card">
                        <div class="step-num">2</div>
                        <h3>添加任务</h3>
                        <p>添加项目任务，设置任务名称、负责人、开始时间和结束时间</p>
                    </div>
                    
                    <div class="step-arrow">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
                        </svg>
                    </div>
                    
                    <div class="step-card">
                        <div class="step-num">3</div>
                        <h3>建立关联</h3>
                        <p>设置任务之间的依赖关系，建立父子任务结构，形成完整计划</p>
                    </div>
                    
                    <div class="step-arrow">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"/>
                        </svg>
                    </div>
                    
                    <div class="step-card">
                        <div class="step-num">4</div>
                        <h3>跟踪进度</h3>
                        <p>更新任务完成进度，对比基线计划，导出报表进行汇报</p>
                    </div>
                </div>
                
                <div class="howto-cta">
                    <el-button class="cta-btn" size="large" @click="goHome">
                        开始制作我的甘特图
                        <el-icon class="ml-1"><ArrowRight /></el-icon>
                    </el-button>
                </div>
            </div>
        </section>

        <!-- 常见问题 -->
        <section id="faq" class="faq-section">
            <div class="section-container">
                <h2 class="section-title">常见问题</h2>
                
                <div class="faq-list">
                    <div class="faq-item">
                        <h3 class="faq-question">星甘甘特图是免费的吗？</h3>
                        <p class="faq-answer">
                            是的，星甘是一款<strong>免费开源</strong>的在线甘特图制作工具。您可以免费使用
                            甘特图创建、编辑、导出等核心功能，无需下载安装，直接在浏览器中使用。
                        </p>
                    </div>
                    
                    <div class="faq-item">
                        <h3 class="faq-question">在线甘特图需要下载安装吗？</h3>
                        <p class="faq-answer">
                            不需要。星甘是一款<strong>纯Web在线工具</strong>，您只需打开浏览器访问
                            stargantt.cn 即可开始使用，无需下载任何软件或插件。
                        </p>
                    </div>
                    
                    <div class="faq-item">
                        <h3 class="faq-question">数据安全性如何保障？</h3>
                        <p class="faq-answer">
                            星甘采用<strong>云端加密存储</strong>，您的项目数据安全保存在服务器。
                            同时支持本地导出备份，您可以随时下载项目数据到本地保存。
                        </p>
                    </div>
                    
                    <div class="faq-item">
                        <h3 class="faq-question">支持哪些导出格式？</h3>
                        <p class="faq-answer">
                            星甘支持导出为<strong>Excel格式</strong>，导出的文件包含完整的任务列表
                            和甘特图图表，方便进行汇报和存档。
                        </p>
                    </div>
                    
                    <div class="faq-item">
                        <h3 class="faq-question">可以多人协作吗？</h3>
                        <p class="faq-answer">
                            星甘支持<strong>项目分享</strong>功能，您可以将项目分享给团队成员，
                            实现多人协作编辑，共同完成项目计划。
                        </p>
                    </div>
                    
                    <div class="faq-item">
                        <h3 class="faq-question">手机上能用吗？</h3>
                        <p class="faq-answer">
                            可以。星甘提供<strong>移动端适配版本</strong>，您可以在手机或平板上
                            查看项目进度。完整的编辑功能建议在电脑端使用。
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 底部CTA -->
        <section class="cta-section">
            <div class="section-container">
                <div class="cta-content">
                    <h2>开始使用免费在线甘特图工具</h2>
                    <p>加入数万用户，用星甘让项目管理更高效</p>
                    <el-button class="cta-main-btn" size="large" @click="goHome">
                        立即免费使用
                        <el-icon class="ml-1"><ArrowRight /></el-icon>
                    </el-button>
                </div>
            </div>
        </section>

        <!-- 页脚 -->
        <footer class="about-footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <img class="footer-logo" src="/favicon-32x32.png" alt="星甘" />
                    <span class="footer-name">星甘 StarGantt</span>
                </div>
                <p class="footer-desc">免费开源的在线甘特图制作工具，让项目进度管理更简单</p>
                <div class="footer-links">
                    <router-link to="/" class="footer-link">首页</router-link>
                    <router-link to="/help" class="footer-link">帮助中心</router-link>
                    <router-link to="/gantt-chart-online" class="footer-link">关于星甘</router-link>
                </div>
                <p class="footer-copyright">© 2026 星甘 StarGantt - 在线甘特图制作平台</p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
    router.push('/')
}

const goHelp = () => {
    router.push('/help')
}
</script>

<style scoped>
.about-page {
    min-height: 100vh;
    background: #ffffff;
    font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 顶部导航 */
.about-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand-section {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.logo-icon {
    width: 32px;
    height: 32px;
}

.app-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
}

.nav-link {
    color: #4a5568;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
}

.nav-link:hover {
    color: #0078d4;
}

.try-btn {
    gap: 4px;
}

/* Hero区域 */
.hero-section {
    padding: 120px 24px 60px;
    background: linear-gradient(135deg, #f8fafc 0%, #e8f4fd 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    max-width: 1200px;
    margin: 0 auto;
}

.hero-content {
    flex: 1;
    max-width: 560px;
}

.hero-badge {
    display: inline-block;
    background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 20px;
}

.hero-title {
    font-size: 42px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 12px;
    line-height: 1.2;
}

.hero-title .highlight {
    color: #0078d4;
}

.hero-subtitle {
    font-size: 20px;
    font-weight: 500;
    color: #4a5568;
    margin: 0 0 20px;
}

.hero-desc {
    font-size: 15px;
    color: #64748b;
    line-height: 1.8;
    margin: 0 0 28px;
}

.hero-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.action-btn.primary {
    background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

.action-btn.primary:hover {
    background: linear-gradient(135deg, #006cbd 0%, #0098d4 100%);
}

.action-btn.secondary {
    background: white;
    border: 1px solid #e2e8f0;
    color: #4a5568;
}

.action-btn.secondary:hover {
    border-color: #0078d4;
    color: #0078d4;
}

.btn-icon {
    width: 18px;
    height: 18px;
}

.hero-stats {
    display: flex;
    align-items: center;
    gap: 24px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #0078d4;
}

.stat-label {
    font-size: 13px;
    color: #64748b;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: #e2e8f0;
}

.hero-visual {
    flex: 1;
    max-width: 520px;
}

.visual-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.screenshot-img {
    width: 100%;
    height: auto;
    display: block;
}

/* 通用Section样式 */
.section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.section-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a2e;
    text-align: center;
    margin: 0 0 12px;
}

.section-desc {
    font-size: 16px;
    color: #64748b;
    text-align: center;
    margin: 0 0 48px;
}

/* 介绍Section */
.intro-section {
    padding: 80px 24px;
    background: #ffffff;
}

.intro-content {
    max-width: 800px;
    margin: 0 auto;
}

.intro-text p {
    font-size: 16px;
    color: #4a5568;
    line-height: 1.9;
    margin: 0 0 20px;
}

.intro-highlights {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 32px;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: #f8fafc;
    border-radius: 10px;
    font-size: 15px;
    color: #334155;
    font-weight: 500;
}

.highlight-icon {
    font-size: 20px;
}

/* 功能特点Section */
.features-section {
    padding: 80px 24px;
    background: #f8fafc;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

.feature-card {
    background: white;
    padding: 28px 24px;
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: #0078d4;
}

.feature-icon-wrap {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
}

.feature-icon {
    font-size: 26px;
}

.feature-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 10px;
}

.feature-card p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
}

/* 应用场景Section */
.scenarios-section {
    padding: 80px 24px;
    background: #ffffff;
}

.scenarios-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.scenario-card {
    background: #f8fafc;
    padding: 28px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
}

.scenario-card:hover {
    background: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.scenario-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.scenario-icon {
    font-size: 28px;
}

.scenario-header h3 {
    font-size: 17px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0;
}

.scenario-card > p {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 16px;
}

.scenario-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.scenario-list li {
    font-size: 13px;
    color: #4a5568;
    padding: 6px 0;
    padding-left: 20px;
    position: relative;
}

.scenario-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #0078d4;
    font-weight: 600;
}

/* 如何制作Section */
.howto-section {
    padding: 80px 24px;
    background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%);
}

.howto-section .section-title,
.howto-section .section-desc {
    color: white;
}

.howto-section .section-desc {
    opacity: 0.9;
}

.steps-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 48px;
}

.step-card {
    background: white;
    padding: 28px 24px;
    border-radius: 12px;
    text-align: center;
    width: 200px;
}

.step-num {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%);
    color: white;
    font-size: 18px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
}

.step-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 10px;
}

.step-card p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
}

.step-arrow {
    color: rgba(255, 255, 255, 0.6);
}

.howto-cta {
    text-align: center;
}

.cta-btn {
    background: white;
    color: #0078d4;
    font-weight: 600;
    padding: 12px 32px;
    font-size: 16px;
}

.cta-btn:hover {
    background: #f8fafc;
}

/* FAQ Section */
.faq-section {
    padding: 80px 24px;
    background: #f8fafc;
}

.faq-list {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.faq-item {
    background: white;
    padding: 24px 28px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.faq-question {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 12px;
}

.faq-answer {
    font-size: 14px;
    color: #64748b;
    line-height: 1.8;
    margin: 0;
}

/* CTA Section */
.cta-section {
    padding: 80px 24px;
    background: #1a1a2e;
}

.cta-content {
    text-align: center;
}

.cta-content h2 {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px;
}

.cta-content p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 32px;
}

.cta-main-btn {
    background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%);
    border: none;
    font-size: 16px;
    font-weight: 600;
    padding: 14px 36px;
}

.cta-main-btn:hover {
    background: linear-gradient(135deg, #006cbd 0%, #0098d4 100%);
}

/* 页脚 */
.about-footer {
    padding: 40px 24px;
    background: #0f0f1a;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

.footer-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;
}

.footer-logo {
    width: 28px;
    height: 28px;
}

.footer-name {
    font-size: 18px;
    font-weight: 600;
    color: white;
}

.footer-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 20px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
}

.footer-link {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 0.2s;
}

.footer-link:hover {
    color: #0078d4;
}

.footer-copyright {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .hero-section {
        flex-direction: column;
        padding: 100px 24px 40px;
        gap: 40px;
    }
    
    .hero-content {
        max-width: 100%;
        text-align: center;
    }
    
    .hero-actions {
        justify-content: center;
    }
    
    .hero-stats {
        justify-content: center;
    }
    
    .hero-visual {
        max-width: 100%;
    }
    
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .scenarios-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .steps-container {
        flex-wrap: wrap;
    }
    
    .step-arrow {
        display: none;
    }
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .hero-title {
        font-size: 32px;
    }
    
    .hero-subtitle {
        font-size: 18px;
    }
    
    .hero-actions {
        flex-direction: column;
    }
    
    .hero-stats {
        flex-direction: column;
        gap: 16px;
    }
    
    .stat-divider {
        width: 60px;
        height: 1px;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .scenarios-grid {
        grid-template-columns: 1fr;
    }
    
    .intro-highlights {
        grid-template-columns: 1fr;
    }
    
    .section-title {
        font-size: 26px;
    }
    
    .step-card {
        width: 100%;
        max-width: 280px;
    }
}

.ml-1 {
    margin-left: 4px;
}
</style>

