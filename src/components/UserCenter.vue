<template>
  <div class="user-center">
    <!-- 顶部账号信息 -->
    <div class="user-header">
      <div class="user-info">
        <div class="avatar">
          <el-avatar :size="60" :src="userInfo.avatar" icon="User" />
        </div>
        <div class="user-details">
          <h3 class="username">{{ userInfo.username || '未登录' }}</h3>
          <p class="user-level">{{ userInfo.level || '免费版' }}</p>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-label">创建数量</span>
          <span class="stat-value">{{ userStats.createdCount }}/{{ userStats.maxCreated }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">收藏数量</span>
          <span class="stat-value">{{ userStats.favoriteCount }}/{{ userStats.maxFavorite }}</span>
        </div>
      </div>
    </div>

    <!-- 版本对比表格 -->
    <div class="version-comparison">
      <h2 class="section-title">版本对比</h2>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th class="feature-column">功能特性</th>
              <th class="version-column" :class="{ active: currentVersion === 'free' }">
                <div class="version-header">
                  <span class="version-name">免费版</span>
                  <span class="version-price">免费</span>
                </div>
              </th>
              <th class="version-column" :class="{ active: currentVersion === 'personal' }">
                <div class="version-header">
                  <span class="version-name">个人版</span>
                  <span class="version-price">¥9/月</span>
                </div>
              </th>
              <th class="version-column" :class="{ active: currentVersion === 'premium' }">
                <div class="version-header">
                  <span class="version-name">旗舰版</span>
                  <span class="version-price">¥29/月</span>
                </div>
              </th>
              <th class="version-column" :class="{ active: currentVersion === 'enterprise' }">
                <div class="version-header">
                  <span class="version-name">本地部署</span>
                  <span class="version-price">5999元/套</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="feature-name">创建数量</td>
              <td class="feature-value">1</td>
              <td class="feature-value">5</td>
              <td class="feature-value unlimited">无限</td>
              <td class="feature-value unlimited">无限</td>
            </tr>
            <tr>
              <td class="feature-name">收藏数量</td>
              <td class="feature-value">1</td>
              <td class="feature-value">5</td>
              <td class="feature-value unlimited">无限</td>
              <td class="feature-value unlimited">无限</td>
            </tr>
            <tr>
              <td class="feature-name">数据导出</td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
            </tr>
            <tr>
              <td class="feature-name">API接口</td>
              <td class="feature-value">
                <el-icon class="cross-icon"><Close /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="cross-icon"><Close /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon"><Check /></el-icon>
              </td>
            </tr>
            <tr>
              <td class="feature-name">技术支持</td>
              <td class="feature-value">社区支持</td>
              <td class="feature-value">优先支持</td>
              <td class="feature-value">专属支持</td>
              <td class="feature-value">专属支持</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 升级按钮 -->
      <div class="upgrade-actions">
        <el-button 
          v-if="currentVersion !== 'personal'" 
          type="primary" 
          @click="handleUpgrade('personal')"
          class="upgrade-btn"
        >
          升级到个人版
        </el-button>
        <el-button 
          v-if="currentVersion !== 'premium'" 
          type="success" 
          @click="handleUpgrade('premium')"
          class="upgrade-btn"
        >
          升级到旗舰版
        </el-button>
        <el-button 
          type="info" 
          @click="handleContact"
          class="upgrade-btn"
        >
          联系本地部署
        </el-button>
      </div>
    </div>
  </div>

  <!-- 支付对话框 -->
  <PaymentDialog 
    v-model="paymentDialogVisible" 
    :version="selectedUpgradeVersion"
    @payment-success="handlePaymentSuccess"
  />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, User } from '@element-plus/icons-vue'
import PaymentDialog from './PaymentDialog.vue'

// 用户信息
const userInfo = reactive({
  username: '',
  level: '免费版',
  avatar: ''
})

// 用户统计
const userStats = reactive({
  createdCount: 0,
  maxCreated: 1,
  favoriteCount: 0,
  maxFavorite: 1
})

// 当前版本
const currentVersion = ref('free')

// 支付对话框相关
const paymentDialogVisible = ref(false)
const selectedUpgradeVersion = ref('personal')

// 版本配置
const versionConfig = {
  free: {
    name: '免费版',
    maxCreated: 1,
    maxFavorite: 1
  },
  personal: {
    name: '个人版',
    maxCreated: 5,
    maxFavorite: 5
  },
  premium: {
    name: '旗舰版',
    maxCreated: -1, // -1 表示无限
    maxFavorite: -1
  },
  enterprise: {
    name: '本地部署',
    maxCreated: -1,
    maxFavorite: -1
  }
}

// 初始化用户信息
const initUserInfo = () => {
  // 从本地存储或API获取用户信息
  const storedUser = localStorage.getItem('userInfo')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    userInfo.username = user.name || user.username || '未登录'
    userInfo.level = user.level || '免费版'
    userInfo.avatar = user.avatar || ''
    currentVersion.value = user.version || 'free'
  }
  
  // 更新用户统计限制
  const config = versionConfig[currentVersion.value]
  if (config) {
    userStats.maxCreated = config.maxCreated
    userStats.maxFavorite = config.maxFavorite
  }
  
  // 模拟获取用户统计数据
  userStats.createdCount = 0
  userStats.favoriteCount = 0
}

// 处理升级
const handleUpgrade = (version) => {
  if (version === 'enterprise') {
    // 本地部署需要联系客服
    handleContact()
  } else {
    // 个人版和旗舰版直接打开支付对话框
    selectedUpgradeVersion.value = version
    paymentDialogVisible.value = true
  }
}

// 联系客服
const handleContact = () => {
  ElMessage.info('正在为您转接客服...')
  // 这里可以打开客服窗口或跳转到联系页面
}

// 处理支付成功
const handlePaymentSuccess = (paymentData) => {
  ElMessage.success('支付成功！您的会员已开通')
  
  // 更新用户版本信息
  currentVersion.value = paymentData.version
  userInfo.level = versionConfig[paymentData.version].name
  
  // 更新用户统计限制
  const config = versionConfig[paymentData.version]
  if (config) {
    userStats.maxCreated = config.maxCreated
    userStats.maxFavorite = config.maxFavorite
  }
  
  // 保存到本地存储
  const userData = {
    ...userInfo,
    version: paymentData.version,
    level: versionConfig[paymentData.version].name
  }
  localStorage.setItem('userInfo', JSON.stringify(userData))
}

onMounted(() => {
  initUserInfo()
})
</script>

<style scoped>
.user-center {
  padding: 16px;
  background: #f5f7fa;
  min-height: auto;
}

.user-header {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
}

.user-level {
  font-size: 14px;
  color: #909399;
  margin: 0;
  padding: 3px 10px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 16px;
  display: inline-block;
}

.user-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.version-comparison {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.comparison-table {
  overflow-x: auto;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th, td {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.feature-column {
  background: #f8f9fa;
  font-weight: 600;
  color: #303133;
  text-align: left;
  width: 160px;
  font-size: 14px;
}

.version-column {
  background: #fafafa;
  transition: all 0.3s ease;
  position: relative;
}

.version-column.active {
  background: #f0f9ff;
  border: 2px solid #409eff;
}

.version-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.version-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.version-price {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.feature-name {
  text-align: left;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
}

.feature-value {
  color: #303133;
  font-weight: 500;
  font-size: 13px;
}

.feature-value.unlimited {
  color: #67c23a;
  font-weight: 600;
}

.check-icon {
  color: #67c23a;
  font-size: 16px;
}

.cross-icon {
  color: #f56c6c;
  font-size: 16px;
}

.upgrade-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.upgrade-btn {
  min-width: 100px;
  font-size: 13px;
  padding: 8px 16px;
}

@media (max-width: 768px) {
  .user-center {
    padding: 12px;
  }
  
  .user-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 12px;
  }
  
  .user-stats {
    gap: 16px;
  }
  
  .version-comparison {
    padding: 12px;
  }
  
  .upgrade-actions {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  
  .upgrade-btn {
    width: 100%;
    max-width: 180px;
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .comparison-table {
    margin-bottom: 12px;
  }
  
  th, td {
    padding: 8px 6px;
    font-size: 12px;
  }
  
  .feature-column {
    width: 120px;
  }
}
</style>
