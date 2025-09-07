<template>
  <el-dialog v-model="visible" title="" width="400px" :close-on-click-modal="false" :close-on-press-escape="false"
    :show-close="false" center>
    <div class="login-container">
      <div class="login-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <p class="subtitle">{{ isLogin ? '欢迎回来' : '加入我们' }}</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" prefix-icon="User" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock"
            show-password />
        </el-form-item>

        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" size="large" prefix-icon="Lock"
            show-password />
        </el-form-item>

        <el-form-item v-if="!isLogin" label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" size="large" prefix-icon="Message" />
        </el-form-item>
      </el-form>

      <div class="login-actions">
        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>

        <div class="switch-mode">
          <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <el-button type="text" @click="switchMode" class="switch-btn">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </el-button>
        </div>
      </div>

      <!-- 快速登录提示 -->
      <div class="quick-tip" v-if="isLogin">
        <el-alert title="演示账号：admin / 123456" type="info" :closable="false" show-icon />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { login, register } from '../api/login.js'
import { setToken } from '../utils/auth.js'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'login-success'])

// 响应式数据
const formRef = ref()
const isLogin = ref(true)
const loading = ref(false)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  }

  if (!isLogin.value) {
    baseRules.confirmPassword = [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.password) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
    baseRules.email = [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
  }

  return baseRules
})

// 切换登录/注册模式
const switchMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isLogin.value) {
      await handleLogin()
    } else {
      await handleRegister()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理登录
const handleLogin = async () => {
  try {
    const response = await login({
      username: form.username,
      password: form.password
    })

    if (response.code === 200) {
      // 保存token
      setToken(response.token)
      visible.value = false
      emit('login-success')
      resetForm()
    }
  } catch (error) {
    ElMessage.error('登录失败：' + (error.message || '用户名或密码错误'))
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    const response = await register({
      username: form.username,
      password: form.password,
      email: form.email
    })

    if (response) {
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      form.confirmPassword = ''
      form.email = ''
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败：' + (error.message || '注册过程中出现错误'))
  }
}

// 暴露方法给父组件
defineExpose({
  resetForm
})
</script>

<style scoped>
.login-container {
  padding: 20px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  text-align: left;
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.login-actions {
  margin-top: 30px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
}

.switch-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
}

.switch-btn {
  padding: 0;
  font-size: 14px;
  color: #409eff;
}

.switch-btn:hover {
  color: #66b1ff;
}

.quick-tip {
  margin-top: 20px;
  text-align: left;
}

.quick-tip :deep(.el-alert) {
  border-radius: 6px;
}

.quick-tip :deep(.el-alert__title) {
  font-size: 13px;
}

/* 对话框样式覆盖 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  display: none;
}

:deep(.el-dialog__body) {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto;
  }

  .login-container {
    padding: 15px;
  }

  .login-header h2 {
    font-size: 20px;
  }
}
</style>