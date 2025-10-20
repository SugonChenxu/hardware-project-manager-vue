<template>
    <el-dialog v-model="dialogVisible" title="版本更新提示" width="480px" :close-on-click-modal="false"
        :close-on-press-escape="false" :show-close="false">
        <div class="update-content">
            <div class="update-header">
                <el-icon :size="48" color="#409EFF">
                    <Upload />
                </el-icon>
                <div class="update-title">发现新版本！</div>
            </div>

            <div class="update-message">{{ updateMessage }}</div>

            <div v-if="updateDetails && updateDetails.length > 0" class="update-details">
                <div class="details-title">更新内容：</div>
                <div class="details-list">
                    <div v-for="(detail, index) in updateDetails" :key="index" class="detail-item">
                        {{ detail }}
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button v-if="showCancelButton" @click="handleCancel">稍后更新</el-button>
                <el-button type="primary" @click="handleConfirm">立即更新</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const props = defineProps({
    // 控制对话框显示隐藏
    modelValue: {
        type: Boolean,
        default: false
    },
    // 更新提示信息
    updateMessage: {
        type: String,
        default: '系统已更新到最新版本，请刷新页面以获得最佳体验。'
    },
    // 更新详情列表
    updateDetails: {
        type: Array,
        default: () => []
    },
    // 是否显示取消按钮
    showCancelButton: {
        type: Boolean,
        default: true
    },
    // 刷新前的回调
    beforeRefresh: {
        type: Function,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogVisible = ref(props.modelValue)

// 监听props变化
watch(() => props.modelValue, (newVal) => {
    dialogVisible.value = newVal
})

// 监听内部状态变化
watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
})

// 点击确定按钮
const handleConfirm = async () => {
    // 触发确认事件
    emit('confirm')

    // 执行刷新前的回调
    if (props.beforeRefresh && typeof props.beforeRefresh === 'function') {
        await props.beforeRefresh()
    }

    // 刷新页面
    window.location.reload(true)
}

// 点击取消按钮
const handleCancel = () => {
    dialogVisible.value = false
    emit('cancel')
}

// 暴露方法供父组件调用
defineExpose({
    open: () => {
        dialogVisible.value = true
    },
    close: () => {
        dialogVisible.value = false
    }
})
</script>

<style scoped>
.update-content {
    text-align: center;
    padding: 10px 0;
}

.update-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
}

.update-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.update-message {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 16px;
}

.update-details {
    text-align: left;
    background: #f5f7fa;
    border-radius: 6px;
    padding: 12px 16px;
}

.details-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
}

.details-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.detail-item {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    padding-left: 0;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
}

:deep(.el-dialog__header) {
    padding: 16px 20px 12px;
    text-align: center;
}

:deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
}

:deep(.el-dialog__body) {
    padding: 16px 24px;
}

:deep(.el-dialog__footer) {
    padding: 12px 20px 20px;
}
</style>
