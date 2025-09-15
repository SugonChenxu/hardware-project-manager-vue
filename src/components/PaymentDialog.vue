<template>
  <el-dialog
    v-model="visible"
    title="开通会员"
    width="500px"
    :close-on-click-modal="false"
    class="payment-dialog"
    @close="handleClose"
  >
    <div class="payment-content">
      <!-- 版本选择 -->
      <div class="version-selection">
        <h3 class="section-title">选择版本</h3>
        <div class="version-cards">
          <div 
            v-for="(version, key) in versionOptions" 
            :key="key"
            class="version-card"
            :class="{ active: selectedVersion === key }"
            @click="selectVersion(key)"
          >
            <div class="version-info">
              <h4 class="version-name">{{ version.name }}</h4>
              <p class="version-price">¥{{ version.price }}/月</p>
              <p class="version-desc">{{ version.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 订阅时长 -->
      <div class="duration-selection">
        <h3 class="section-title">订阅时长</h3>
        <div class="duration-input">
          <el-input-number
            v-model="months"
            :min="1"
            :max="12"
            :step="1"
            size="large"
            class="month-input"
            @change="calculateTotal"
          />
          <span class="duration-label">个月</span>
        </div>
        <div class="duration-tips">
          <span v-if="months >= 6" class="tip-text">选择6个月以上享受9折优惠</span>
          <span v-else class="tip-text">选择6个月以上享受9折优惠</span>
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
        <div v-if="discount > 0" class="price-row discount-row">
          <span class="price-label">优惠：</span>
          <span class="price-value discount">-¥{{ discount.toFixed(2) }}</span>
        </div>
        <div class="price-row total-row">
          <span class="price-label">总计：</span>
          <span class="price-value total">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 支付状态 -->
      <div v-if="paymentStatus === 'pending'" class="payment-status">
        <div class="qr-code-container">
          <h4 class="qr-title">请使用微信扫码支付</h4>
          <div class="qr-code">
            <div v-if="qrCodeUrl" class="qr-image">
              <img :src="qrCodeUrl" alt="微信支付二维码" />
            </div>
            <div v-else class="qr-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <p>正在生成支付二维码...</p>
            </div>
          </div>
          <p class="qr-tips">请使用微信扫描上方二维码完成支付</p>
          <div class="payment-actions">
            <el-button @click="cancelPayment">取消支付</el-button>
            <el-button type="primary" @click="btnCheckPaymentStatus">检查支付状态</el-button>
          </div>
        </div>
      </div>

      <!-- 支付成功 -->
      <div v-if="paymentStatus === 'success'" class="payment-success">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h4>支付成功！</h4>
        <p>您的会员已开通，感谢您的支持！</p>
        <el-button type="primary" @click="handleClose">确定</el-button>
      </div>

      <!-- 支付失败 -->
      <div v-if="paymentStatus === 'failed'" class="payment-failed">
        <el-icon class="failed-icon"><CircleClose /></el-icon>
        <h4>支付失败</h4>
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="retryPayment">重新支付</el-button>
      </div>
    </div>

    <template #footer v-if="paymentStatus === 'idle'">
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="creatingOrder"
          @click="createOrder"
          :disabled="!selectedVersion || months < 1"
        >
          {{ creatingOrder ? '创建订单中...' : '立即开通' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { createPaymentOrder, checkPaymentStatus } from '@/api/payment'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  version: {
    type: String,
    default: 'personal'
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
const qrCodeUrl = ref('')
const errorMessage = ref('')
const orderId = ref('')

// 版本配置
const versionOptions = {
  personal: {
    name: '个人版',
    price: 9,
    description: '适合个人用户使用'
  },
  premium: {
    name: '旗舰版',
    price: 29,
    description: '适合团队协作使用'
  }
}

// 计算属性
const selectedVersionInfo = computed(() => versionOptions[selectedVersion.value])

const discount = computed(() => {
  if (months.value >= 6) {
    const originalPrice = selectedVersionInfo.value?.price * months.value
    return originalPrice * 0.1 // 9折优惠
  }
  return 0
})

const totalPrice = computed(() => {
  const originalPrice = selectedVersionInfo.value?.price * months.value
  return originalPrice - discount.value
})

// 方法
const selectVersion = (version) => {
  selectedVersion.value = version
  calculateTotal()
}

const calculateTotal = () => {
  // 价格计算逻辑已在计算属性中处理
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
      version: selectedVersion.value,
      months: months.value,
      totalAmount: totalPrice.value,
      productName: `${selectedVersionInfo.value.name} ${months.value}个月`
    }

    const result = await createPaymentOrder(orderData)
    
    if (result.success) {
      orderId.value = result.data.orderId
      qrCodeUrl.value = result.data.qrCodeUrl
      
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

const startPaymentStatusPolling = () => {
  const pollInterval = setInterval(async () => {
    try {
      const result = await checkPaymentStatus(orderId.value)
      
      if (result.success) {
        if (result.data.status === 'SUCCESS') {
          clearInterval(pollInterval)
          paymentStatus.value = 'success'
          ElMessage.success('支付成功！')
          emit('payment-success', {
            version: selectedVersion.value,
            months: months.value,
            orderId: orderId.value
          })
        } else if (result.data.status === 'CLOSED' || result.data.status === 'REVOKED') {
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
  qrCodeUrl.value = ''
  orderId.value = ''
}

const retryPayment = () => {
  paymentStatus.value = 'idle'
  qrCodeUrl.value = ''
  orderId.value = ''
  createOrder()
}

const handleClose = () => {
  visible.value = false
  // 重置状态
  paymentStatus.value = 'idle'
  qrCodeUrl.value = ''
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
    padding: 20px;
  }
}

.payment-content {
  max-height: 60vh;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.version-selection {
  margin-bottom: 24px;
}

.version-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.version-card {
  flex: 1;
  min-width: 120px;
  padding: 16px;
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
  margin: 0 0 8px 0;
}

.version-price {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin: 0 0 8px 0;
}

.version-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.duration-selection {
  margin-bottom: 24px;
}

.duration-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

.total-row {
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
  margin-top: 8px;
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
  max-width: 300px;
  margin: 0 auto;
}

.qr-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qr-tips {
  font-size: 12px;
  color: #909399;
  margin: 0 0 16px 0;
}

.payment-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.payment-success,
.payment-failed {
  text-align: center;
  padding: 40px 20px;
}

.success-icon,
.failed-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
  margin: 0 0 8px 0;
}

.payment-success p,
.payment-failed p {
  font-size: 14px;
  color: #606266;
  margin: 0 0 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .version-cards {
    flex-direction: column;
  }
  
  .version-card {
    min-width: auto;
  }
  
  .qr-code {
    width: 160px;
    height: 160px;
  }
  
  .payment-actions {
    flex-direction: column;
  }
}
</style>
