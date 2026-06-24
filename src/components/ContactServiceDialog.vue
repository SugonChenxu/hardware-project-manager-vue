<template>
  <el-dialog v-model="showDialog" title="联系客服" width="400px" align-center>
    <div class="contact-service-content">
      <div class="qr-code-section">
        <div class="qr-code-container">
          <img src="/qq.png" alt="扫码加QQ群" class="qr-code-image" />
        </div>
          <p class="qr-code-tip">使用QQ扫一扫加入星甘大家庭</p>
        
      </div>
    </div>
    <template #footer>
      <div class="contact-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

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
  width: 220px;
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