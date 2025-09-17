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
          <div class="user-level">
            <el-tag v-if="currentVersion.length === 0" type="info" size="small">免费版</el-tag>
            <template v-else>
              <el-tag v-for="version in currentVersion" :key="version.rechargeType"
                :type="getVersionTagType(version.rechargeType)" size="small" class="version-tag">
                {{ version.name }}
                <span class="expire-date">{{ formatExpireDate(version.expireDate) }}</span>
              </el-tag>
            </template>
          </div>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-label">创建数量</span>
          <span class="stat-value">{{ userStats.createdCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">收藏数量</span>
          <span class="stat-value">{{ userStats.favoriteCount }}</span>
        </div>
      </div>
    </div>

    <!-- 优惠信息 -->
    <div class="promo-section">
      <h2 class="section-title">优惠活动</h2>
      <div class="promo-cards">
        <div class="promo-card first-recharge-promo">
          <div class="promo-icon">🎉</div>
          <div class="promo-content">
            <h3 class="promo-title">首次充值优惠</h3>
            <p class="promo-desc">个人版首次充值首月仅需¥1</p>
            <div class="promo-tag">限时优惠</div>
          </div>
        </div>
        <div class="promo-card long-term-promo">
          <div class="promo-icon">💰</div>
          <div class="promo-content">
            <h3 class="promo-title">长期订阅优惠</h3>
            <p class="promo-desc">选择6个月以上享受8折优惠</p>
            <div class="promo-tag">长期优惠</div>
          </div>
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
              <th class="version-column" :class="{ active: currentVersion.length == 0 }">
                <div class="version-header">
                  <span class="version-name">免费版</span>
                  <span class="version-price">免费</span>
                </div>
              </th>
              <th class="version-column"
                :class="{ active: currentVersion.length > 0 && currentVersion.some(item => item.rechargeType == 'UserPersonal') }">
                <div class="version-header">
                  <span class="version-name">个人版</span>
                  <span class="version-price">¥9/月</span>
                </div>
              </th>
              <th class="version-column"
                :class="{ active: currentVersion.length > 0 && currentVersion.some(item => item.rechargeType == 'UserEnterprise') }">
                <div class="version-header">
                  <span class="version-name">旗舰版</span>
                  <span class="version-price">¥29/月</span>
                </div>
              </th>
              <th class="version-column">
                <div class="version-header">
                  <span class="version-name">本地部署</span>
                  <span class="version-price">¥5999/套</span>
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
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
              </td>
            </tr>
            <tr>
              <td class="feature-name">API接口</td>
              <td class="feature-value">
                <el-icon class="cross-icon">
                  <Close />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="cross-icon">
                  <Close />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
              </td>
              <td class="feature-value">
                <el-icon class="check-icon">
                  <Check />
                </el-icon>
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
        <el-button type="primary" @click="handleUpgrade('UserPersonal')" class="upgrade-btn">
          升级到个人版
        </el-button>
        <el-button type="success" @click="handleUpgrade('UserEnterprise')" class="upgrade-btn">
          升级到旗舰版
        </el-button>
        <el-button type="info" @click="handleContact" class="upgrade-btn">
          联系本地部署
        </el-button>
      </div>
    </div>
  </div>

  <!-- 支付对话框 -->
  <PaymentDialog v-model="paymentDialogVisible" :version="selectedUpgradeVersion"
    @payment-success="handlePaymentSuccess" />

  <!-- 联系客服对话框 -->
  <ContactServiceDialog v-model="showContactDialog" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, User } from '@element-plus/icons-vue'
import PaymentDialog from './PaymentDialog.vue'
import ContactServiceDialog from './ContactServiceDialog.vue'
import { getToken } from '@/utils/auth'
import { getUserVip } from '../api/users'
import { getUserProfile } from '../api/login'
import { getProjCnt } from '../api/sysproject'
import dayjs from 'dayjs'

// 用户信息
const userInfo = reactive({
  username: '',
  avatar: ''
})

// 用户统计
const userStats = reactive({
  createdCount: 0,  // 创建数量
  maxCreated: 1,  // 创建数量上限
  favoriteCount: 0,  // 收藏数量
  maxFavorite: 1  // 收藏数量上限
})

// 当前版本
const currentVersion = ref([])

// 支付对话框相关
const paymentDialogVisible = ref(false)
const selectedUpgradeVersion = ref('UserPersonal')
const showContactDialog = ref(false)

// 版本配置
const versionConfig = {
  free: {
    name: '免费版',
    maxCreated: 1,
    maxFavorite: 1
  },
  UserPersonal: {
    name: '个人版',
    maxCreated: 5,
    maxFavorite: 5
  },
  UserEnterprise: {
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
  showContactDialog.value = true
}

// 处理支付成功
const handlePaymentSuccess = (paymentData) => {
  ElMessage.success('支付成功！刷新后生效')
}

// 获取版本标签类型
const getVersionTagType = (rechargeType) => {
  switch (rechargeType) {
    case 'UserPersonal':
      return 'primary'
    case 'UserEnterprise':
      return 'success'
    default:
      return 'info'
  }
}

// 格式化过期日期
const formatExpireDate = (expireDate) => {
  if (!expireDate) return ''

  const now = dayjs()
  const expire = dayjs(expireDate)
  const diffDays = expire.diff(now, 'day')

  if (diffDays < 0) {
    return '已过期'
  } else if (diffDays === 0) {
    return '今日到期'
  } else if (diffDays <= 7) {
    return `${diffDays}天后到期`
  } else {
    return expire.format('YYYY-MM-DD')
  }
}

onMounted(async () => {
  // 从本地存储或API获取用户信息
  const storedUser = localStorage.getItem('userInfo')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    userInfo.username = user.name || user.username || '未登录'
    userInfo.avatar = user.avatar || ''
  }

  let loginres;

  // 如果用户已登录则加载用户登录信息
  if (userInfo.value == null && getToken()) {
    loginres = await getUserProfile();
    if (loginres.code != 200) {
      return;
    }
    userInfo.username = loginres.data.account;
    var vip = await getUserVip();
    if (vip.code != 200) {
      return;
    }
    if (vip.data.length > 0) {
      for (let i = 0; i < vip.data.length; i++) {
        const config = versionConfig[vip.data[i].rechargeType]
        currentVersion.value.push({
          expireDate: vip.data[i].expireDate,
          rechargeType: vip.data[i].rechargeType,
          name: config.name
        })
      }

    }
  }

  let projCnt = await getProjCnt();
  if (projCnt.code == 200) {
    userStats.createdCount = projCnt.data.createCnt
    userStats.favoriteCount = projCnt.data.favoriteCnt
  }
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
  margin: 6px 0 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.version-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expire-date {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 4px;
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

.promo-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.promo-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.promo-card {
  flex: 1;
  min-width: 280px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.promo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.promo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.first-recharge-promo {
  background: linear-gradient(135deg, #fff7e6 0%, #ffeaa7 100%);
  border-color: #e6a23c;
}

.long-term-promo {
  background: linear-gradient(135deg, #f0f9ff 0%, #b3d8ff 100%);
  border-color: #409eff;
}

.promo-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.promo-content {
  flex: 1;
}

.promo-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.promo-desc {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.promo-tag {
  display: inline-block;
  background: #409eff;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.first-recharge-promo .promo-tag {
  background: #e6a23c;
}

.long-term-promo .promo-tag {
  background: #67c23a;
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

th,
td {
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

  th,
  td {
    padding: 8px 6px;
    font-size: 12px;
  }

  .feature-column {
    width: 120px;
  }
}
</style>
