<template>
  <el-dialog v-model="visible" title="" width="380px" :close-on-click-modal="false" :close-on-press-escape="false"
    :show-close="false" center class="login-dialog">
    <div class="login-container">
      <!-- 头部 -->
      <div class="login-header">
        <div class="login-icon">
          <svg class="icon" viewBox="0 0 1024 1024" width="32" height="32">
            <path d="M512 512m-320 0a320 320 0 1 0 640 0 320 320 0 1 0-640 0Z" fill="#409EFF"></path>
            <path d="M398.72 377.6h226.56v268.8H398.72z" fill="#FFFFFF"></path>
            <path d="M512 326.4a64 64 0 1 0 0-128 64 64 0 0 0 0 128z" fill="#FFFFFF"></path>
          </svg>
        </div>
        <h2 class="login-title">{{ isLogin ? '登录' : '注册' }}</h2>
        <p class="login-subtitle">{{ isLogin ? '欢迎回来' : '创建新账户' }}</p>
      </div>

      <!-- 表单 -->
      <el-form :model="form" :rules="rules" ref="formRef" class="login-form" @keyup.enter="handleSubmit">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" class="form-input" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" prefix-icon="Lock"
            show-password class="form-input" />
        </el-form-item>

        <transition name="slide-fade">
          <el-form-item v-if="!isLogin" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" prefix-icon="Lock"
              show-password class="form-input" />
          </el-form-item>
        </transition>

        <transition name="slide-fade">
          <el-form-item v-if="!isLogin" prop="email">
            <el-input v-model="form.email" placeholder="邮箱地址" size="large" prefix-icon="Message" class="form-input" />
          </el-form-item>
        </transition>
      </el-form>

      <!-- 操作按钮 -->
      <div class="login-actions">
        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>

        <div class="switch-mode">
          <span class="switch-text">{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <el-button type="text" @click="switchMode" class="switch-btn">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </el-button>
        </div>
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
/* 对话框样式 */
.login-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  animation: gradientMove 6s ease infinite;
  padding: 2px;
}

.login-dialog :deep(.el-dialog__header) {
  display: none;
}

.login-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #ffffff;
  border-radius: 14px;
}

/* 容器样式 */
.login-container {
  padding: 28px 24px 24px;
  text-align: center;
  position: relative;
}

/* 头部样式 */
.login-header {
  margin-bottom: 24px;
}

.login-icon {
  margin-bottom: 12px;
  animation: pulse 2s infinite;
}

.login-title {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 1px;
}

.login-subtitle {
  margin: 0;
  color: #8c939d;
  font-size: 13px;
  font-weight: 400;
}

/* 表单样式 */
.login-form {
  text-align: left;
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__content) {
  line-height: normal;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e4e7ed;
}

.form-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  border-color: #c0c4cc;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

.form-input :deep(.el-input__inner) {
  font-size: 14px;
  padding: 12px 16px;
}

.form-input :deep(.el-input__prefix) {
  padding-left: 16px;
}

/* 操作按钮 */
.login-actions {
  margin-top: 24px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

/* 切换模式 */
.switch-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.switch-text {
  color: #8c939d;
}

.switch-btn {
  padding: 0 4px;
  font-size: 13px;
  color: #409eff;
  font-weight: 500;
  transition: all 0.3s ease;
}

.switch-btn:hover {
  color: #66b1ff;
  transform: scale(1.05);
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes gradientMove {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto;
  }

  .login-container {
    padding: 24px 20px 20px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-btn {
    height: 42px;
    font-size: 14px;
  }
}

/* 表单验证错误样式优化 */
.login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56c6c;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
}

.login-form :deep(.el-form-item__error) {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}
</style>