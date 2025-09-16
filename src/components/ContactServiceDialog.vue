<template>
  <el-dialog v-model="showDialog" title="联系客服" width="400px" align-center>
    <div class="contact-service-content">
      <div class="qr-code-section">
        <h3>扫码添加微信客服</h3>
        <div class="qr-code-container">
          <!-- 这里放置微信二维码图片 -->
          <img src="/kefu.png" alt="微信二维码" class="qr-code-image" />
        </div>
        <p class="qr-code-tip">使用微信扫一扫添加客服微信</p>
        <div class="wechat-info">
          <p><strong>微信号：</strong>yubaolee</p>
          <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="contact-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" @click="copyWechatId">复制微信号</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue'])

// 计算属性 - 双向绑定
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 关闭对话框
const closeDialog = () => {
  emit('update:modelValue', false)
}

// 复制微信号
const copyWechatId = () => {
  const wechatId = 'yubaolee'
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(wechatId).then(() => {
      ElMessage.success('微信号已复制到剪贴板')
    }).catch(() => {
      fallbackCopyTextToClipboard(wechatId)
    })
  } else {
    fallbackCopyTextToClipboard(wechatId)
  }
}

// 兼容性复制函数
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
    ElMessage.success('微信号已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制微信号')
  }
  document.body.removeChild(textArea)
}
</script>

<style scoped>
/* 客服联系对话框样式 */
.contact-service-content {
  text-align: center;
  padding: 20px 0;
}

.qr-code-section h3 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-code-image {
  width: 200px;
  height: 200px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.qr-code-tip {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
}

.wechat-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.wechat-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.wechat-info strong {
  color: #303133;
  font-weight: 600;
}

.contact-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style> 