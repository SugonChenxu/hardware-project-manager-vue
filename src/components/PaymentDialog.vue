<template>
  <el-dialog v-model="visible" title="开通会员" width="800px" :close-on-click-modal="false" class="payment-dialog"
    @close="handleClose">
    <div class="payment-content">
      <!-- 支付状态时的左右布局 -->
      <div v-if="paymentStatus === 'pending' || paymentStatus === 'success' || paymentStatus === 'failed'" class="payment-layout">
        <!-- 左侧内容 -->
        <div class="left-panel">
          <!-- 版本选择 -->
          <div class="version-selection">
            <h3 class="section-title">选择版本</h3>
            <div class="version-cards">
              <div v-for="(version, key) in versionOptions" :key="key" class="version-card"
                :class="{ active: selectedVersion === key }" @click="selectVersion(key)">
                <div class="version-info">
                  <h4 class="version-name">{{ version.name }}</h4>
                  <p class="version-price">¥{{ version.price }}/月</p>
                  <p class="version-desc">{{ version.description }}</p>
                  <p v-if="key === 'UserPersonal' && !firstVip" class="version-promo">首次充值首月仅需¥1</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 订阅时长 -->
          <div class="duration-selection">
            <h3 class="section-title">订阅时长</h3>
            <div class="duration-input">
              <el-input-number v-model="months" :min="1" :max="12" :step="1" size="large" class="month-input"
                @change="calculateTotal" />
              <span class="duration-label">个月</span>
            </div>
            <div class="duration-tips">
              <span v-if="months >= 6" class="tip-text">选择6个月以上享受8折优惠</span>
              <span v-else class="tip-text">选择6个月以上享受8折优惠</span>
            </div>
          </div>

          <!-- 价格计算 -->
          <div class="price-calculation">
            <div class="price-row">
              <span class="price-label">单价：</span>
              <span class="price-value">¥{{ selectedVersionInfo?.price || 0 }}/月</span>
            </div>
            <div class="price-row">
              <span class="price-label">时长：</span>
              <span class="price-value">{{ months }}个月</span>
            </div>
            <!-- 首次充值优惠显示 -->
            <div v-if="!firstVip && selectedVersion === 'UserPersonal' && months >= 1" class="price-row first-recharge-row">
              <span class="price-label">首次充值优惠：</span>
              <span class="price-value first-recharge">首月仅需¥1</span>
            </div>
            <div v-if="discount > 0" class="price-row discount-row">
              <span class="price-label">优惠：</span>
              <span class="price-value discount">-¥{{ discount.toFixed(2) }}</span>
            </div>
            <div class="price-row total-row">
              <span class="price-label">总计：</span>
              <span class="price-value total">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="right-panel">
          <!-- 支付二维码 -->
          <div v-if="paymentStatus === 'pending'" class="qr-code-container">
            <h4 class="qr-title">请使用微信扫码支付</h4>
            <div class="qr-code">
              <div v-if="qrCodeDataUrl" class="qr-image">
                <img :src="qrCodeDataUrl" alt="微信支付二维码" />
              </div>
              <div v-else class="qr-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>正在生成支付二维码...</p>
              </div>
            </div>
            <p class="qr-tips">请使用微信扫描上方二维码完成支付</p>
            <div class="payment-actions">
              <el-button @click="cancelPayment">取消支付</el-button>
              <el-button type="primary" @click="btnCheckPaymentStatus">检查支付状态</el-button>
            </div>
          </div>

          <!-- 支付成功 -->
          <div v-if="paymentStatus === 'success'" class="payment-success">
            <el-icon class="success-icon">
              <CircleCheck />
            </el-icon>
            <h4>支付成功！</h4>
            <p>您的会员已开通，感谢您的支持！</p>
            <el-button type="primary" @click="handleClose">确定</el-button>
          </div>

          <!-- 支付失败 -->
          <div v-if="paymentStatus === 'failed'" class="payment-failed">
            <el-icon class="failed-icon">
              <CircleClose />
            </el-icon>
            <h4>支付失败</h4>
            <p>{{ errorMessage }}</p>
            <el-button type="primary" @click="retryPayment">重新支付</el-button>
          </div>
        </div>
      </div>

      <!-- 非支付状态的普通布局 -->
      <div v-else class="normal-layout">
        <!-- 版本选择 -->
        <div class="version-selection">
          <h3 class="section-title">选择版本</h3>
          <div class="version-cards">
            <div v-for="(version, key) in versionOptions" :key="key" class="version-card"
              :class="{ active: selectedVersion === key }" @click="selectVersion(key)">
              <div class="version-info">
                <h4 class="version-name">{{ version.name }}</h4>
                <p class="version-price">¥{{ version.price }}/月</p>
                <p class="version-desc">{{ version.description }}</p>
                <p v-if="key === 'UserPersonal' && !firstVip" class="version-promo">首次充值首月仅需¥1</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 订阅时长 -->
        <div class="duration-selection">
          <h3 class="section-title">订阅时长</h3>
          <div class="duration-input">
            <el-input-number v-model="months" :min="1" :max="36" :step="1" size="large" class="month-input"
              @change="calculateTotal" />
            <span class="duration-label">个月</span>
          </div>
          <div class="duration-tips">
            <span v-if="months >= 6" class="tip-text">选择6个月以上享受8折优惠</span>
            <span v-else class="tip-text">选择6个月以上享受8折优惠</span>
          </div>
        </div>

        <!-- 价格计算 -->
        <div class="price-calculation">
          <div class="price-row">
            <span class="price-label">单价：</span>
            <span class="price-value">¥{{ selectedVersionInfo?.price || 0 }}/月</span>
          </div>
          <div class="price-row">
            <span class="price-label">时长：</span>
            <span class="price-value">{{ months }}个月</span>
          </div>
          <!-- 首次充值优惠显示 -->
          <div v-if="!firstVip && selectedVersion === 'UserPersonal' && months >= 1" class="price-row first-recharge-row">
            <span class="price-label">首次充值优惠：</span>
            <span class="price-value first-recharge">首月仅需¥1</span>
          </div>
          <div v-if="discount > 0" class="price-row discount-row">
            <span class="price-label">优惠：</span>
            <span class="price-value discount">-¥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="price-row total-row">
            <span class="price-label">总计：</span>
            <span class="price-value total">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer v-if="paymentStatus === 'idle'">
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="creatingOrder" @click="createOrder"
          :disabled="!selectedVersion || months < 1">
          {{ creatingOrder ? '创建订单中...' : '立即开通' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { createPaymentOrder, getOrderDetail } from '@/api/payment'
import { getUserVip } from '@/api/users'
import QRCode from 'qrcode'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  version: {
    type: String,
    default: 'UserPersonal'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'payment-success'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedVersion = ref(props.version)
const months = ref(1)
const creatingOrder = ref(false)
const paymentStatus = ref('idle') // idle, pending, success, failed
const qrCodeDataUrl = ref('')
const errorMessage = ref('')
const orderId = ref('')
const firstVip = ref(false) //首次充值

// 版本配置
const versionOptions = {
  UserPersonal: {
    name: '个人版',
    price: 9,
    description: '适合个人用户使用'
  },
  UserEnterprise: {
    name: '旗舰版',
    price: 29,
    description: '适合团队协作使用'
  }
}

// 计算属性
const selectedVersionInfo = computed(() => versionOptions[selectedVersion.value])

//折扣计算
const discount = computed(() => {
  if (months.value >= 6) {
    const originalPrice = selectedVersionInfo.value?.price * months.value
    return originalPrice * 0.2 // 8折优惠
  }
  return 0
})

const totalPrice = computed(() => {
  let originalPrice = selectedVersionInfo.value?.price * months.value
  
  // 个人版首次充值首月1元优惠
  if (!firstVip.value && selectedVersion.value === 'UserPersonal' && months.value >= 1) {
    const firstMonthPrice = 1 // 首月1元
    const remainingMonths = months.value - 1
    const remainingPrice = selectedVersionInfo.value?.price * remainingMonths
    originalPrice = firstMonthPrice + remainingPrice
  }
  
  return originalPrice - discount.value
})

onMounted(async () => {
  const vip = await getUserVip()
  if (vip.code != 200) {
    return
  }
  if (vip.data.length > 0) {
    firstVip.value = true
  }
})

// 方法
const selectVersion = (version) => {
  selectedVersion.value = version
  calculateTotal()
}

const calculateTotal = () => {
  // 价格计算逻辑已在计算属性中处理
}

// 生成二维码
const generateQRCode = async (url) => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 160,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    qrCodeDataUrl.value = dataUrl
  } catch (error) {
    ElMessage.error('生成二维码失败')
  }
}

const createOrder = async () => {
  if (!selectedVersion.value || months.value < 1) {
    ElMessage.warning('请选择版本和订阅时长')
    return
  }

  creatingOrder.value = true
  paymentStatus.value = 'pending'

  try {
    // 创建订单
    const orderData = {
      rechargeType: selectedVersion.value,
      month: months.value,
      amount: totalPrice.value,
      body: `${selectedVersionInfo.value.name} ${months.value}个月`
    }

    const result = await createPaymentOrder(orderData)

    if (result.code === 200) {
      orderId.value = result.data.outTradeNo
      
      // 生成二维码
      await generateQRCode(result.data.codeUrl)

      // 开始轮询支付状态
      startPaymentStatusPolling()
    } else {
      throw new Error(result.message || '创建订单失败')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    paymentStatus.value = 'failed'
    errorMessage.value = error.message || '创建订单失败，请重试'
    ElMessage.error(errorMessage.value)
  } finally {
    creatingOrder.value = false
  }
}

let pollInterval = null //定时轮询
const startPaymentStatusPolling = () => {
  pollInterval = setInterval(async () => {
    try {
      const result = await getOrderDetail(orderId.value)

      if (result.code === 200) {
        if (result.data.tradeState === 'SUCCESS') {
          clearInterval(pollInterval)
          paymentStatus.value = 'success'
          emit('payment-success', {
            version: selectedVersion.value,
            months: months.value,
            orderId: orderId.value
          })
        } else if (result.data.tradeState === 'CLOSED' || result.data.tradeState === 'REVOKED') {
          clearInterval(pollInterval)
          paymentStatus.value = 'failed'
          errorMessage.value = '订单已关闭'
        }
      }
    } catch (error) {
      console.error('检查支付状态失败:', error)
    }
  }, 3000) // 每3秒检查一次

  // 5分钟后停止轮询
  setTimeout(() => {
    clearInterval(pollInterval)
    if (paymentStatus.value === 'pending') {
      paymentStatus.value = 'failed'
      errorMessage.value = '支付超时，请重新支付'
    }
  }, 300000)
}

const btnCheckPaymentStatus = () => {
  if (orderId.value) {
    startPaymentStatusPolling()
  }
}

const cancelPayment = () => {
  paymentStatus.value = 'idle'
  qrCodeDataUrl.value = ''
  orderId.value = ''
  if(pollInterval != null){
    clearInterval(pollInterval)
  }
}

const retryPayment = () => {
  paymentStatus.value = 'idle'
  qrCodeDataUrl.value = ''
  orderId.value = ''
  createOrder()
}

const handleClose = () => {
  visible.value = false
  // 重置状态
  paymentStatus.value = 'idle'
  qrCodeDataUrl.value = ''
  orderId.value = ''
  errorMessage.value = ''
}

// 监听版本变化
watch(() => props.version, (newVersion) => {
  selectedVersion.value = newVersion
})
</script>

<style scoped>
.payment-dialog {
  .el-dialog__body {
    padding: 16px;
  }
}

.payment-content {
  max-height: none;
  overflow: visible;
}

.payment-layout {
  display: flex;
  gap: 16px;
}

.left-panel {
  flex: 2;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.right-panel {
  flex: 1;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.normal-layout {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.version-selection {
  margin-bottom: 16px;
}

.version-cards {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.version-card {
  flex: 1;
  min-width: 120px;
  padding: 12px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.version-card:hover {
  border-color: #409eff;
}

.version-card.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.version-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
}

.version-price {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin: 0 0 6px 0;
}

.version-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.version-promo {
  font-size: 11px;
  color: #e6a23c;
  font-weight: 600;
  margin: 4px 0 0 0;
  background: #fdf6ec;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.duration-selection {
  margin-bottom: 16px;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.month-input {
  width: 120px;
}

.duration-label {
  font-size: 14px;
  color: #606266;
}

.duration-tips {
  font-size: 12px;
  color: #67c23a;
}

.price-calculation {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 14px;
  color: #606266;
}

.price-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.discount-row .price-value {
  color: #67c23a;
}

.first-recharge-row .price-value {
  color: #e6a23c;
  font-weight: 600;
}

.total-row {
  border-top: 1px solid #ebeef5;
  padding-top: 6px;
  margin-top: 6px;
}

.total-row .price-label {
  font-weight: 600;
  color: #303133;
}

.total-row .price-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.payment-status {
  text-align: center;
  padding: 20px;
}

.qr-code-container {
  text-align: center;
  width: 100%;
}

.qr-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.qr-code {
  width: 160px;
  height: 160px;
  margin: 0 auto 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.qr-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-loading {
  text-align: center;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 8px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.qr-tips {
  font-size: 12px;
  color: #909399;
  margin: 0 0 12px 0;
}

.payment-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.payment-success,
.payment-failed {
  text-align: center;
  padding: 20px 16px;
}

.success-icon,
.failed-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.success-icon {
  color: #67c23a;
}

.failed-icon {
  color: #f56c6c;
}

.payment-success h4,
.payment-failed h4 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
}

.payment-success p,
.payment-failed p {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .payment-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    padding: 10px;
  }

  .version-cards {
    flex-direction: column;
  }

  .version-card {
    min-width: auto;
  }

  .qr-code {
    width: 140px;
    height: 140px;
  }

  .payment-actions {
    flex-direction: column;
  }
}
</style>
