<template>
  <div class="gantt-page">
    <!-- 顶部工具栏 - Outlook风格 -->
    <div class="outlook-toolbar">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="app-logo">
          <img class="logo-icon" src="/favicon-32x32.png" alt="星甘StarGantt" />
          <span class="app-name">星甘</span>
        </div>
        <div class="project-selector">
          <el-dropdown class="project-dropdown" v-model:visible="projectDropdownVisible" :hide-on-click="false"
            trigger="click" @visible-change="handleDropdownVisibleChange">
            <div class="project-info" @click="toggleProjectDropdown">
              <span class="project-title">{{ projectInfo?.name || '未命名项目' }}</span>
              <span class="project-meta">{{ projectInfo?.code || '无' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="project-menu">
                <div class="project-details">
                  <div class="detail-row">
                    <span class="label">名称</span>
                    <div class="editable-field" v-if="!editingField.name" @click="startEdit('name')">
                      <span class="value editable">{{ projectInfo?.name || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <el-input v-else v-model="editingValue" ref="nameInput" size="small" class="inline-edit-input"
                      @keyup.enter="confirmEdit('name')" @blur="confirmEdit('name')" @keyup.esc="cancelEdit" />
                  </div>
                  <div class="detail-row">
                    <span class="label">编码</span>
                    <div class="editable-field" v-if="!editingField.code" @click="startEdit('code')">
                      <span class="value editable">{{ projectInfo?.code || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <el-input v-else v-model="editingValue" ref="codeInput" size="small" class="inline-edit-input"
                      @keyup.enter="confirmEdit('code')" @blur="confirmEdit('code')" @keyup.esc="cancelEdit" />
                  </div>
                  <div class="detail-row">
                    <span class="label">描述</span>
                    <div class="editable-field" v-if="!editingField.description" @click="startEdit('description')">
                      <span class="value editable">{{ projectInfo?.description || '点击编辑' }}</span>
                      <el-icon class="edit-icon">
                        <Edit />
                      </el-icon>
                    </div>
                    <div v-else class="textarea-container">
                      <el-input v-model="editingValue" ref="descriptionInput" type="textarea" :rows="2" size="small"
                        class="inline-edit-textarea" @keyup.ctrl.enter="confirmEdit('description')"
                        @blur="confirmEdit('description')" @keyup.esc="cancelEdit" />
                    </div>
                  </div>

                  <div class="detail-row" v-if="projectInfo?.updateTime">
                    <span class="label">更新时间</span>
                    <span class="value readonly">{{ projectInfo?.updateTime }}</span>
                    <el-button type="primary" link size="small" @click="openHistoryDialog" v-if="projectInfo?.id">
                      <el-icon>
                        <Clock />
                      </el-icon>
                      历史版本
                    </el-button>
                  </div>
                  <div class="detail-row" v-else>
                    <span class="label">创建时间</span>
                    <span class="value readonly">{{ projectInfo?.createTime }}</span>
                  </div>

                  <div class="detail-row action-row">
                    <span class="label">创建人</span>
                    <span class="value readonly">{{ projectInfo?.createUserName }}</span>
                  </div>
                  <div class="detail-row action-row" v-if="projectInfo?.createUserId == userInfo?.id">
                    <el-button type="danger" size="small" @click="deleteProject">删除项目</el-button>
                  </div>
                  <div class="detail-row action-row">
                    <el-button type="primary" size="small" @click="saveAsTemplate">
                      保存为默认模板
                    </el-button>
                  </div>
                  <div class="detail-row action-row">
                    <el-button type="info" size="small" @click="debugLocalStorage">
                      调试：查看本地数据
                    </el-button>
                  </div>
                  <div class="detail-row action-row">
                    <el-button type="success" size="small" @click="exportTemplateJSON">
                      导出模板JSON
                    </el-button>
                  </div>

                  <!-- 权限设置 -->
                  <div class="detail-row permission-row" v-if="projectInfo?.createUserId == userInfo?.id">
                    <span class="label">权限：</span>
                    <div class="value">
                      <el-radio-group v-model="projectPermission.visibilityScope" size="small"
                        @change="handleVisibilityScopeChange">
                        <el-radio :label="0">私有</el-radio>
                        <el-radio :label="1">指定人员</el-radio>
                        <el-radio :label="2">所有人可查看</el-radio>
                        <el-radio :label="3">所有人可编辑</el-radio>
                      </el-radio-group>
                    </div>
                  </div>

                  <!-- 当选择"仅指定人员"时显示 -->
                  <div class="permission-shared-config"
                    v-if="projectInfo?.createUserId == userInfo?.id && projectPermission.visibilityScope === 1">
                    <div class="config-item config-item-users">
                      <span class="config-label">指定人员[姓名(账号)]</span>
                      <el-select v-model="projectPermission.permissionUserIds" multiple filterable remote
                        :reserve-keyword="false" placeholder="请输入姓名或账号搜索" :remote-method="searchUsers"
                        :loading="userSearchLoading" @change="saveProject" size="small">
                        <el-option v-for="item in userOptions" :key="item.id" :label="`${item.name} (${item.account})`"
                          :value="item.id" />
                      </el-select>
                    </div>
                    <div class="config-item config-item-type">
                      <span class="config-label">权限类型</span>
                      <el-radio-group v-model="projectPermission.permissionType" size="small" @change="saveProject">
                        <el-radio label="VIEW">可查看</el-radio>
                        <el-radio label="EDIT">可编辑</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-tooltip :content="isStarred ? '已收藏' : '收藏'" placement="bottom">
          <el-button class="outlook-btn icon-only" :class="{ 'starred': isStarred }" @click="toggleStar"
            :loading="starring" v-if="checkShowStarBtn()">
            <el-icon>
              <StarFilled v-if="isStarred" />
              <Star v-else />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 中间操作区域 -->
      <div class="action-section">
        <!-- 项目切换选择器 -->
        <div class="project-switch-section" v-if="projectList.length > 0">
          <el-select v-model="currentProjectCode" class="project-selector" placeholder="选择项目" filterable size="default"
            @change="switchProject">
            <template #prefix>
              <el-icon>
                <FolderAdd />
              </el-icon>
            </template>
            <el-option v-for="project in projectList" :key="project.code" :label="project.name" :value="project.code">
              <div class="project-option">
                <span class="project-name">{{ project.name }}</span>
                <span class="project-code">{{ project.code }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <el-button-group class="split-btn-group">
          <el-button class="outlook-btn primary split-main" @click="createNewProject">
            <el-icon>
              <FolderAdd />
            </el-icon>
            <span>新项目</span>
          </el-button>
          <el-dropdown @command="handleProjectCommand" trigger="click">
            <el-button class="outlook-btn primary split-dropdown">
              <el-icon>
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="copy">📋 复制项目</el-dropdown-item>
              </el-dropdown-menu>
              <el-dropdown-menu>
                <el-dropdown-item command="AIGenTask">📋 DeepSeek生成</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-button-group>

        <el-button class="outlook-btn" @click="saveProject" :loading="saving">
          <el-icon>
            <Document />
          </el-icon>
          <span>保存</span>
        </el-button>

        <el-button class="outlook-btn primary" @click="addTask">
          <el-icon>
            <Plus />
          </el-icon>
          <span>新任务</span>
        </el-button>

        <el-popover placement="bottom-start" :width="200" trigger="hover" popper-class="more-menu-popover">
          <template #reference>
            <el-button class="outlook-btn dropdown-btn">
              <el-icon>
                <MoreFilled />
              </el-icon>
              <span>更多</span>
              <el-icon class="dropdown-arrow">
                <ArrowDown />
              </el-icon>
            </el-button>
          </template>
          <el-menu ref="moreMenuRef" @select="handleMoreCommand" class="more-menu">
            <el-menu-item index="export">
              <el-icon>
                <Download />
              </el-icon>
              <span>导出</span>
            </el-menu-item>

            <el-sub-menu index="baseline">
              <template #title>
                <el-icon>
                  <Aim />
                </el-icon>
                <span>基线</span>
              </template>
              <el-menu-item index="setBaseline">设置</el-menu-item>
              <el-menu-item index="delBaseline">删除</el-menu-item>
              <el-menu-item index="toggleBaseline">{{ baselineVisible ? '隐藏' : '显示' }}</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="expand">
              <el-icon>
                <Expand />
              </el-icon>
              <span>展开全部</span>
            </el-menu-item>
            <el-menu-item index="collapse">
              <el-icon>
                <Fold />
              </el-icon>
              <span>折叠全部</span>
            </el-menu-item>
            <el-menu-item index="toggleTodayLine" divided>
              <el-icon>
                <Sort />
              </el-icon>
              <span>{{ toggleTodayLineEnabled ? '禁用今日线' : '启用今日线' }}</span>
            </el-menu-item>
            <el-menu-item index="toggleDragSort" divided>
              <el-icon>
                <Sort />
              </el-icon>
              <span>{{ dragSortEnabled ? '禁用拖拽排序' : '启用拖拽排序' }}</span>
            </el-menu-item>
            <el-menu-item disabled v-if="dragSortEnabled">
              <span style="font-size: 11px; color: #909399;">💡 拖拽表格行可调整任务顺序</span>
            </el-menu-item>
          </el-menu>
        </el-popover>

        <div class="divider"></div>

        <el-dropdown class="view-mode-dropdown" @command="changeView">
          <el-button class="outlook-btn dropdown-btn">
            <span>{{ viewModeLabel }}</span>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="default">📅 默认视图</el-dropdown-item>
              <el-dropdown-item command="month">📆 月视图</el-dropdown-item>
              <el-dropdown-item command="quarter">📊 季度视图</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown class="column-control">
          <el-button class="outlook-btn dropdown-btn">
            <el-icon>
              <Operation />
            </el-icon>
            <span>列设置</span>
            <el-icon class="dropdown-arrow">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="column-control-menu">
              <div class="panel-actions">
                <el-button size="small" type="text" @click="selectAllColumns" title="列表">📄</el-button>
                <el-button size="small" type="text" @click="selectHalfColumns" title="平衡">↔️</el-button>
                <el-button size="small" type="text" @click="unselectAllColumns" title="甘特图">📈</el-button>
              </div>
              <el-divider style="margin: 8px 0;" />
              <div class="column-section">
                <div class="section-title">
                  <span style="font-size: 11px; color: #909399; margin-left: 8px;">🖐️ 按住☰拖动排序</span>
                </div>
                <el-checkbox-group v-model="visibleColumns" class="column-checkboxes" ref="allColumnsContainer">
                  <el-checkbox v-for="column in sortedAllColumns" :key="column.name" :label="column.name"
                    :data-column-name="column.name" :data-is-custom="column.isCustom ? 'true' : 'false'"
                    class="draggable-column-item">
                    {{ column.label }}
                    <el-button v-if="column.isCustom" type="danger" size="small" link
                      @click.stop="deleteCustomColumn(column.name)" style="margin-left: 4px;">🗑️</el-button>
                    <span class="drag-handle">☰</span>

                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <el-divider style="margin: 8px 0;" />
              <el-button size="small" type="text" @click="showAddColumnDialog = true" style="width: 100%;">
                <el-icon>
                  <Plus />
                </el-icon>
                <span>添加列</span>
              </el-button>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-tooltip :content="cascade ? '关联调整已开启：修改任务时间会自动调整有关联关系的任务时间' : '关联调整已关闭：即使有关联关系，修改任务时间也互不影响'"
          placement="bottom">
          <el-button @click="cascade = !cascade" :class="cascade ? 'outlook-btn checked' : 'outlook-btn'">
            <el-icon>
              <Link />
            </el-icon>
            <span>{{ cascade ? '已开启关联' : '已关闭关联' }}</span>
          </el-button>
        </el-tooltip>

        <div class="divider"></div>

        <!-- 帮助和客服按钮组 -->
        <el-button-group class="help-btn-group">
          <el-tooltip content="帮助文档" placement="bottom">
            <el-button class="outlook-btn icon-only" @click="openHelp">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="联系客服" placement="bottom">
            <el-button class="outlook-btn icon-only" @click="contactService">
              <el-icon>
                <ChatDotSquare />
              </el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 右侧用户区域 -->
      <div class="user-section">
        <el-dropdown @command="handleUserCommand" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="28" class="user-avatar">
              {{ userInfo?.name ? userInfo.name.charAt(0) : '游' }}
            </el-avatar>
            <span class="user-name">{{ userInfo?.name || '游客' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item divided command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="changePassword" v-if="userInfo">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout" v-if="userInfo">退出登录</el-dropdown-item>
              <el-dropdown-item command="login" v-else>立即登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 甘特图容器 -->
    <div class="gantt-container" :class="{ 'grid-resizing': isGridResizing }">
      <div ref="ganttContainer" class="gantt-chart"></div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="gantt-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }" @click.stop>
      <div class="context-menu-header" v-if="currentTask">
        <span class="task-text">{{ currentTask.text }}</span>
      </div>
      <div class="context-menu-divider"></div>



      <!-- 背景色选择 -->
      <div class="context-menu-section">
        <div class="context-menu-title">标记背景色</div>
        <div class="color-quick-select">
          <div v-for="color in backgroundColors.filter(c => c.name !== '清除')" :key="color.name"
            class="color-quick-option" :title="color.name" @click="setTaskBackgroundColor(color.css)">
            <div class="color-indicator" :style="{ backgroundColor: color.color }"></div>
          </div>
          <div class="color-quick-option" title="清除" @click="setTaskBackgroundColor('')">
            <el-icon class="clear-quick-icon">
              <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                <path fill="currentColor"
                  d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zM288 312v-48a24 24 0 0 1 24-24h400a24 24 0 0 1 24 24v48a24 24 0 0 1-24 24H312a24 24 0 0 1-24-24z" />
              </svg>
            </el-icon>
          </div>
        </div>
      </div>
      <div class="context-menu-divider"></div>

      <!-- 阶段选择 -->
      <div class="context-menu-section">
        <div class="context-menu-title">设置阶段</div>
        <div class="stage-quick-select">
          <div v-for="stage in projectStages" :key="stage.name"
            class="stage-quick-option" :title="stage.name" @click="setTaskStage(stage)">
            <div class="stage-indicator" :style="{ backgroundColor: stage.color }"></div>
            <span class="stage-name">{{ stage.name }}</span>
          </div>
          <div class="stage-quick-option" title="清除阶段" @click="setTaskStage({ name: '', backgroundColor: '' })">
            <el-icon class="clear-quick-icon">
              <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                <path fill="currentColor"
                  d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zM288 312v-48a24 24 0 0 1 24-24h400a24 24 0 0 1 24 24v48a24 24 0 0 1-24 24H312a24 24 0 0 1-24-24z" />
              </svg>
            </el-icon>
            <span class="stage-name">清除</span>
          </div>
        </div>
      </div>
      <div class="context-menu-divider"></div>

      <!-- 任务类型选择 -->
      <div class="context-menu-item" @click.stop>
        <el-dropdown @command="setTaskType" :hide-on-click="true" placement="right-start">
          <span class="dropdown-item-text">
            <el-icon>
              <Edit />
            </el-icon>
            修改任务类型
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="task">📋 普通任务</el-dropdown-item>
              <el-dropdown-item command="project">📁 项目组</el-dropdown-item>
              <el-dropdown-item command="milestone">🎯 里程碑</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="context-menu-divider"></div>

      <!-- 升级/降级菜单项 -->
      <div class="context-menu-item" :class="{ disabled: !canPromoteTask }" @click="promoteTask">
        <el-icon>
          <Back />
        </el-icon>
        <span>升级</span>
      </div>
      <div class="context-menu-item" :class="{ disabled: !canDemoteTask }" @click="demoteTask">
        <el-icon>
          <Right />
        </el-icon>
        <span>降级</span>
      </div>
      <div class="context-menu-divider"></div>

      <!-- 菜单项 -->
      <div class="context-menu-item" @click="copyTask">
        <el-icon>
          <CopyDocument />
        </el-icon>
        <span>复制任务</span>
      </div>
      <div class="context-menu-item" @click="contextMenuOpenEditDialog">
        <el-icon>
          <Edit />
        </el-icon>
        <span>编辑任务</span>
      </div>
      <div class="context-menu-item danger" @click="confirmDeleteTask">
        <el-icon>
          <Delete />
        </el-icon>
        <span>删除任务</span>
      </div>
    </div>

    <!-- 隐藏的文件上传input -->
    <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv,.json" @change="handleFileUpload"
      style="display: none;" />

    <!-- 编辑任务对话框 -->
    <el-dialog draggable v-model="showEditDialog" title="编辑任务" width="800px">
      <el-form :model="editTask" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="任务名称">
              <el-input v-model="editTask.text" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="任务类型">
              <el-select v-model="editTask.type" style="width: 100%">
                <el-option label="普通任务" value="task" />
                <el-option label="项目组" value="project" />
                <el-option label="里程碑" value="milestone" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker v-model="editTask.start_date" type="date" placeholder="选择开始时间" style="width: 100%"
                @change="calculateDurationForEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="完成时间">
              <el-date-picker v-model="editTask.end_date" type="date" placeholder="选择完成时间" style="width: 100%"
                @change="calculateDurationForEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工期(天)">
              <el-input-number v-model="editTask.duration" :min="1" :max="3650" :step="1" style="width: 100%"
                @change="calculateEndDateForEdit" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="执行状态">
              <el-select v-model="editTask.status" style="width: 100%">
                <el-option label="未开始" value="not_started" />
                <el-option label="进行中" value="in_progress" />
                <el-option label="已完成" value="completed" />
                <el-option label="已暂停" value="on_hold" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>

          </el-col>
          <el-col :span="8">
            <el-form-item label="完成进度">
              <el-slider v-model="editTask.progress" :max="1" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目阶段">
              <el-select v-model="editTask.stage" placeholder="选择阶段（可选）" style="width: 100%" clearable>
                <el-option v-for="stage in projectStages" :key="stage.name" :label="stage.name" :value="stage.name">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 12px; height: 12px; border-radius: 2px; margin-right: 8px;" :style="{ backgroundColor: stage.color }"></div>
                    {{ stage.name }}
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">

          <el-col :span="16">
            <el-form-item label="负责人">
              <el-select v-model="editTask.owner" multiple filterable allow-create default-first-option
                :reserve-keyword="false" placeholder="💡 可选择已有负责人或输入新负责人，可多选" style="width: 100%">
                <el-option v-for="item in projectOwners" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="相关方">
              <el-input v-model="editTask.stakeholder" placeholder="请输入相关方" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="前置任务">
              <el-select v-model="editTask.predecessors" multiple placeholder="选择前置任务（可多选）" style="width: 100%">
                <el-option v-for="task in availableTasksForPredecessors(editTask.id)" :key="task.id"
                  :label="`${task.id} - ${task.text}`" :value="task.id" />
              </el-select>
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">
                💡 选择前置任务后产生关联关系，调整任务时间会相互影响
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="父任务">
              <el-select v-model="editTask.parent" placeholder="选择父任务（可选）" style="width: 100%">
                <el-option label="无" :value="0" />
                <el-option v-for="task in tasks.filter(t => t.id !== editTask.id).sort((a, b) => a.id - b.id)"
                  :key="task.id" :label="task.id + ' - ' + task.text" :value="task.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="基线开始时间">
              <el-date-picker v-model="editTask.planned_start" type="date" placeholder="选择基线开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基线完成时间">
              <el-date-picker v-model="editTask.planned_end" type="date" placeholder="选择基线完成时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <div style="color: #909399; font-size: 12px; margin-left: 100px; margin-top: -12px; margin-bottom: 12px;">
          💡 非特殊情况不要单独修改基线时间。可以使用【更多>设置基线】功能统一设置项目基线
        </div>
        <!-- 自定义列 -->
        <el-row :gutter="16" v-if="customColumns.length > 0">
          <el-col :span="12" v-for="column in customColumns" :key="column.name">
            <el-form-item :label="column.label">
              <el-input v-model="editTask[column.name]" :placeholder="`请输入${column.label}`" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="任务描述">
          <el-input v-model="editTask.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateTask">更新任务</el-button>
        <el-button type="danger" @click="confirmDeleteTask">删除任务</el-button>
      </template>
    </el-dialog>

    <!-- 登录模态框 -->
    <LoginModal v-model="showLoginModal" @login-success="handleLoginSuccess" />

    <!-- 个人中心对话框 -->
    <el-dialog v-model="userCenterVisible" draggable width="700px" :close-on-click-modal="false"
      class="user-center-dialog">
      <UserCenter v-if="userCenterVisible" @open-payment="handleOpenPayment" @open-contact="handleOpenContact" />
    </el-dialog>

    <!-- 支付对话框 -->
    <PaymentDialog v-model="paymentDialogVisible" v-if="paymentDialogVisible" :version="selectedUpgradeVersion"
      @payment-success="handlePaymentSuccess" />

    <!-- 客服联系对话框 -->
    <ContactServiceDialog v-model="showContactDialog" />

    <!-- 添加自定义列对话框 -->
    <el-dialog v-model="showAddColumnDialog" title="添加自定义列" width="500px" :close-on-click-modal="false">
      <el-form :model="newColumnForm" label-width="100px">
        <el-form-item label="列名称" required>
          <el-input v-model="newColumnForm.name" placeholder="请输入列名称（英文，如：budget）" maxlength="50" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            列名称用于数据存储，建议使用英文
          </div>
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="newColumnForm.label" placeholder="请输入显示名称（如：预算）" maxlength="20" />
        </el-form-item>
        <el-form-item label="列宽度">
          <el-input-number v-model="newColumnForm.width" :min="50" :max="500" :step="10" />
        </el-form-item>
        <el-form-item label="对齐方式">
          <el-radio-group v-model="newColumnForm.align">
            <el-radio label="left">左对齐</el-radio>
            <el-radio label="center">居中</el-radio>
            <el-radio label="right">右对齐</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddColumnDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomColumn">确定</el-button>
      </template>
    </el-dialog>


    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePasswordDialog" title="修改密码" width="400px" :close-on-click-modal="false">
      <el-form :model="changePasswordForm" :rules="passwordRules" ref="changePasswordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="changePasswordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="changePasswordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="changingPassword">确定</el-button>
      </template>
    </el-dialog>

    <!-- AI生成任务对话框 -->
    <el-dialog v-model="showAIGenDialog" title="AI智能生成项目计划" width="600px" :close-on-click-modal="false">
      <el-form :model="aiGenForm" label-width="100px">
        <el-form-item label="项目内容" required>
          <el-input v-model="aiGenForm.text" type="textarea" :rows="8" 
            placeholder="请输入项目内容，例如：&#10;开发一个网站项目，包含以下工作：&#10;1. 需求分析，预计3天&#10;2. UI设计，预计5天&#10;3. 前端开发，预计10天&#10;4. 后端开发，预计10天&#10;5. 测试，预计5天&#10;6. 部署上线，预计2天" />
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker v-model="aiGenForm.startDate" type="date" placeholder="选择项目开始日期"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAIGenDialog = false">取消</el-button>
        <el-button type="primary" @click="generateTasks" :loading="aiGenerating">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12l8-8"/></svg>
          生成
        </el-button>
      </template>
    </el-dialog>

    <!-- 版本更新对话框 -->
    <VersionUpdateDialog v-model="showVersionUpdateDialog"
      :update-message="`检测到新版本 ${versionUpdateInfo.serverVersion}，当前版本 ${versionUpdateInfo.localVersion}`"
      :update-details="versionUpdateInfo.details" :show-cancel-button="false" />

    <!-- 项目历史记录对话框 -->
    <ProjectHistoryDialog v-model="showHistoryDialog" :project-id="projectInfo?.id" @restore="handleHistoryRestore" />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed, h, createApp, defineComponent, getCurrentInstance } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { getUserProfile } from '../api/login.js'
import { changePassword, getList, loadByIds } from '../api/users.js'
import UserCenter from './UserCenter.vue'
import PaymentDialog from './PaymentDialog.vue'
import ContactServiceDialog from './ContactServiceDialog.vue'
import VersionUpdateDialog from './VersionUpdateDialog.vue'
import ProjectHistoryDialog from './ProjectHistoryDialog.vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ElMessage, ElMessageBox, ElSelect, ElOption, ElInput } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import Sortable from 'sortablejs'
import { exportGanttToExcel } from '../utils/exportExcel.js'
import { getWeekOfMonth } from '../utils/index.js'
import { encryptByMd5 } from '../utils/encrypt.js'

// 设置dayjs为中文
dayjs.locale('zh-cn')
import {
  Calendar, Plus, Expand, Fold, Download, Document, Link,
  ArrowDown, FolderAdd, Operation, MoreFilled, User, Edit, Star, StarFilled, ChatDotSquare, Sort, QuestionFilled, Delete, Aim, CopyDocument,
  Right, Back, Clock
} from '@element-plus/icons-vue'
import {
  loadGanttData,
  saveGanttDataToProject,
  load,
  importFromJson,
  generateNewTaskId,
  getAllSuccessors,
  getAllPredecessors
} from '../services/ganttDataService.js'
import { star, unstar, del, copy } from '../api/sysproject.js'
import { textToGantt } from '../api/ai.js'
import LoginModal from './LoginModal.vue'
import { getToken, removeToken } from '../utils/auth.js'
import { getWebVersion } from '../api/serverConf.js'
import { getItem, setItem } from '../utils/storage.js'

// 中文语言包
const locale = zhCn

const vm = getCurrentInstance()

// 响应式数据
const ganttContainer = ref()
const currentTask = ref(null)  //当前选中的任务
const fileInput = ref()
const nameInput = ref()
const codeInput = ref()
const descriptionInput = ref()
const allColumnsContainer = ref()
const viewMode = ref('default')
const viewModeLabel = computed(() => {
  const labels = {
    default: '📅 默认视图',
    month: '📆 月视图',
    quarter: '📊 季度视图'
  }
  return labels[viewMode.value] || '📅 默认视图'
})
const showEditDialog = ref(false)  // 编辑对话框显示状态
const showLoginModal = ref(false)  // 登录模态框显示状态
const userCenterVisible = ref(false)  // 个人中心对话框显示状态
const showContactDialog = ref(false)  // 客服联系对话框显示状态
const paymentDialogVisible = ref(false)  // 支付对话框显示状态
const showHistoryDialog = ref(false)  // 历史记录对话框显示状态
const selectedUpgradeVersion = ref('UserPersonal')  // 选中的升级版本
const pendingUserCenterOpen = ref(false)  // 待打开个人中心标志
const saving = ref(false) // 保存按钮加载状态

const toggleTodayLineEnabled = ref(true) //今日线显示开关
watch(toggleTodayLineEnabled, (enabled) => {
  if (gantt && gantt.config) {
    if (enabled) {
      gantt.config.show_markers = true
    } else {
      gantt.config.show_markers = false
    }
    gantt.render()
  }
})
// 修改密码相关
const showChangePasswordDialog = ref(false)  // 修改密码对话框显示状态
const changingPassword = ref(false)  // 修改密码提交状态
const changePasswordFormRef = ref()  // 修改密码表单引用
const changePasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== changePasswordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// AI生成任务相关
const showAIGenDialog = ref(false)
const aiGenerating = ref(false)
const aiGenForm = ref({
  text: '',
  startDate: dayjs().format('YYYY-MM-DD')
})

// 任务数据 - 从数据服务加载
const tasks = ref([])
const links = ref([])
const loading = ref(true)
const cascade = ref(true)  //级联
const taskBeforeUpdate = ref(null)  // 保存任务更新前的快照，供级联计算使用

// 项目信息
const projectInfo = ref(null)
const projectList = ref([])
const currentProjectCode = ref('')
const urlParams = ref(null)

// 内联编辑状态
const editingField = ref({
  name: false,
  code: false,
  description: false
})
const editingValue = ref('')
const originalValue = ref('')
const projectDropdownVisible = ref(false) // 项目下拉菜单显示状态

// 用户信息
const userInfo = ref(null)

// 收藏状态
const isStarred = ref(false)
const starring = ref(false) // 收藏操作加载状态

// 项目权限设置
const projectPermission = ref({
  visibilityScope: 3, // 0-仅我自己，1-仅我分享的好友，2-所有人可查看，3-所有人可编辑
  permissionUserIds: [], // 指定的用户ID列表
  permissionType: 'VIEW' // VIEW-可查看，EDIT-可编辑
})

// 用户搜索相关
const userOptions = ref([])
const userSearchLoading = ref(false)

// 搜索用户
const searchUsers = async (query) => {
  if (query) {
    userSearchLoading.value = true
    try {
      const res = await getList({ key: query, page: 1, limit: 5 })
      userOptions.value = res.data
    } catch (e) {
      console.error('搜索用户失败:', e)
    } finally {
      userSearchLoading.value = false
    }
  } else {
    userOptions.value = []
  }
}

// 加载已选择的用户信息
const loadSelectedUsers = async () => {
  if (projectPermission.value.permissionUserIds && projectPermission.value.permissionUserIds.length > 0) {
    try {
      const res = await loadByIds(projectPermission.value.permissionUserIds)
      // 将加载的用户添加到选项中，避免显示ID
      userOptions.value = res.data
    } catch (e) {
      console.error('加载已选用户失败:', e)
    }
  }
}

// 版本号管理
const webVersion = ref('')

// 拖拽排序开关
const dragSortEnabled = ref(true)

// 基线显示开关
const baselineVisible = ref(true)

// 背景色标记功能
const backgroundColors = [
  { name: '红色', css: 'gantt_custom_red', value: '#ffebee', color: '#f44336' },
  { name: '紫色', css: 'gantt_custom_purple', value: '#f3e8ff', color: '#9333EA' },
  { name: '绿色', css: 'gantt_custom_green', value: '#e8f5e8', color: '#4caf50' },
  { name: '蓝色', css: 'gantt_custom_blue', value: '#e3f2fd', color: '#2196f3' },
  { name: '清除', css: '', value: '', color: '#ffffff' }
]

// 项目阶段定义（不同阶段用不同背景色标记）
const projectStages = [
  { name: '需求分析', backgroundColor: 'gantt_custom_blue', color: '#2196f3' },
  { name: '设计阶段', backgroundColor: 'gantt_custom_purple', value: '#f3e8ff', color: '#9333EA' },
  { name: '开发阶段', backgroundColor: 'gantt_custom_green', value: '#e8f5e8', color: '#4caf50' },
  { name: '测试阶段', backgroundColor: 'gantt_custom_orange', value: '#fff3e0', color: '#ff9800' },
  { name: '上线部署', backgroundColor: 'gantt_custom_red', value: '#ffebee', color: '#f44336' },
  { name: '运维支持', backgroundColor: 'gantt_custom_teal', value: '#e0f2f1', color: '#009688' }
]

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

// Grid和Timeline分割线拖拽相关状态
const isGridResizing = ref(false)
const gridWidth = ref(1330) // 默认Grid宽度
const startGridX = ref(0)
const startGridWidth = ref(0)
const minGridWidth = 300 // 最小Grid宽度
const maxGridWidth = 1600 // 最大Grid宽度

// 从localStorage加载Grid宽度设置
const loadGridWidth = () => {
  try {
    const savedWidth = getItem('gantt_grid_width')
    if (savedWidth) {
      gridWidth.value = parseInt(savedWidth)
    }
  } catch (error) {
    console.error('加载Grid宽度设置失败:', error)
  }
}

// 保存Grid宽度设置到localStorage
const saveGridWidth = () => {
  try {
    setItem('gantt_grid_width', gridWidth.value.toString())
  } catch (error) {
    console.error('保存Grid宽度设置失败:', error)
  }
}

// 开始拖拽调整Grid宽度
const startGridResize = (event) => {
  event.preventDefault()
  event.stopPropagation()

  isGridResizing.value = true
  startGridX.value = event.clientX
  startGridWidth.value = gridWidth.value

  // 添加全局事件监听
  document.addEventListener('mousemove', handleGridResize)
  document.addEventListener('mouseup', endGridResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 处理Grid宽度调整
const handleGridResize = (event) => {
  if (!isGridResizing.value) return

  const deltaX = event.clientX - startGridX.value
  const newWidth = Math.max(minGridWidth, Math.min(maxGridWidth, startGridWidth.value + deltaX))

  gridWidth.value = newWidth

  // 立即更新甘特图Grid宽度
  updateGanttGridWidth()
}

// 结束Grid宽度调整
const endGridResize = () => {
  if (isGridResizing.value) {
    isGridResizing.value = false

    // 保存Grid宽度设置
    saveGridWidth()

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleGridResize)
    document.removeEventListener('mouseup', endGridResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}

// 更新甘特图Grid宽度
const updateGanttGridWidth = () => {
  if (gantt && gantt.config) {
    gantt.config.grid_width = gridWidth.value

    // 更新布局配置
    gantt.config.layout = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", id: "grid", width: gridWidth.value, scrollY: "scrollVer" },
            {
              rows: [
                { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", scroll: "x", id: "scrollHor" }
              ]
            },
            { view: "scrollbar", scroll: "y", id: "scrollVer" }
          ]
        }
      ]
    }

    // 重新渲染甘特图
    if (gantt.render) {
      gantt.render()
    }
  }
}

// 根据可见列调整Grid宽度
const adjustGridWidthByColumns = (visibleCols) => {
  if (!visibleCols || visibleCols.length === 0) {
    // 如果没有可见列，设置最小宽度
    gridWidth.value = minGridWidth
    updateGanttGridWidth()
    saveGridWidth()
    return
  }

  // 计算所有可见列的总宽度，使用原始allColumns定义中的宽度
  let totalWidth = 0
  visibleCols.forEach(col => {
    // 从原始allColumns定义中查找对应列的宽度
    const originalCol = allColumns.find(originalCol => originalCol.name === col.name)
    const colWidth = originalCol ? originalCol.width : (col.width || 100)
    totalWidth += colWidth
  })

  // 添加一些额外的padding和滚动条宽度
  const padding = 40 // 内边距和边框等
  const scrollbarWidth = 20 // 垂直滚动条宽度
  const calculatedWidth = totalWidth + padding + scrollbarWidth

  // 确保在最小和最大宽度范围内
  const newWidth = Math.max(minGridWidth, Math.min(maxGridWidth, calculatedWidth))

  // 只有当宽度变化足够大时才更新（避免频繁的微小调整）
  if (Math.abs(newWidth - gridWidth.value) > 10) {
    gridWidth.value = newWidth
    updateGanttGridWidth()
    saveGridWidth()
    console.log(`Grid宽度调整: 可见列${visibleCols.length}个, 计算宽度${calculatedWidth}px, 实际设置${newWidth}px`)
  }
}


// 添加Grid分割线拖拽手柄
const addGridResizeHandle = () => {
  nextTick(() => {
    // 移除旧的拖拽手柄
    const existingHandle = document.querySelector('.grid-resize-handle')
    if (existingHandle) {
      existingHandle.remove()
    }

    // 查找Grid容器
    const gridContainer = document.querySelector('.gantt_grid')
    if (!gridContainer) return

    // 创建拖拽手柄
    const handle = document.createElement('div')
    handle.className = 'grid-resize-handle'
    handle.title = '拖拽调整表格宽度'

    // 添加事件监听
    handle.addEventListener('mousedown', startGridResize)

    // 添加到Grid容器
    gridContainer.style.position = 'relative'
    gridContainer.appendChild(handle)
  })
}

// 版本更新对话框显示状态
const showVersionUpdateDialog = ref(false)
const versionUpdateInfo = ref({
  localVersion: '',
  serverVersion: '',
  details: []
})

// 版本检查函数
const checkVersionAndRefresh = async () => {
  try {
    // 获取服务器版本号
    const serverVersionResponse = await getWebVersion()
    if (serverVersionResponse.code === 200) {
      const serverVersion = serverVersionResponse.data
      webVersion.value = serverVersion

      // 获取本地存储的版本号
      const localVersion = getItem('webVersion')

      // 如果本地版本为空或与服务器版本不同，显示更新对话框
      if (!localVersion || localVersion !== serverVersion) {
        // 设置版本更新信息
        versionUpdateInfo.value = {
          localVersion: localVersion || '未知',
          serverVersion: serverVersion,
          details: [
            '✅ 全新域名：http://stargantt.cn 你的进度星甘守护',
            '✅ 重磅功能：AI智能生成项目计划',
            '            新项目右边向下箭头->DeepSeek生成',
          ]
        }

        // 显示版本更新对话框
        showVersionUpdateDialog.value = true

        // 更新本地存储的版本号
        setItem('webVersion', serverVersion)
        return
      }

      console.log('版本号匹配，无需刷新')
    }
  } catch (error) {
    console.error('版本检查失败:', error)
    // 版本检查失败时，不进行刷新，避免影响正常使用
  }
}

// 编辑任务表单数据
const editTask = ref({
  id: null,
  text: '',
  start_date: new Date(),
  end_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 默认3天后
  duration: 3,
  progress: 0,
  type: 'task',
  parent: 0,
  status: 'not_started',
  owner: '',
  stakeholder: '',
  description: '',
  planned_start: '',
  planned_end: '',
  predecessors: []  // 前置任务列表
})

// 项目中已有的负责人列表
const projectOwners = ref([])


// 可显示的字段（默认值）
const defaultVisibleColumns = ['id', 'text', 'start_date', 'end_date', 'duration', 'status', 'progress', 'owner', 'stakeholder', 'predecessors', 'description']

// 可显示的字段（会从projectInfo中加载）
const visibleColumns = ref([...defaultVisibleColumns])

// 自定义列
const customColumns = ref([])

var ownerEditor = { type: "custom_editor", map_to: "owner" };
var descriptionEditor = { type: "textarea_editor", map_to: "description" };
// 基础列（不可修改）
const allColumns = [
  {
    name: "id",
    label: "ID",
    width: 30,
  },
  {
    name: "text",
    label: "任务名称",
    width: 280,
    tree: true,
    editor: {
      type: "text",
      map_to: "text"
    },
    template: function (task) {
      // 根据任务类型添加 emoji
      const emojiMap = {
        'task': '📋',
        'project': '📁',
        'milestone': '🎯'
      }
      const emoji = emojiMap[task.type] || '📋'
      return emoji + ' ' + task.text
    }
  },
  {
    name: "start_date",
    label: "开始时间",
    width: 100,
    align: "center",
    editor: {
      type: "date",
      map_to: "start_date"
    }
  },
  {
    name: "end_date",
    label: "完成时间",
    width: 100,
    align: "center",
    editor: {
      type: "date",
      map_to: "end_date"
    }
  },
  {
    name: "duration",
    label: "工期",
    width: 60,
    align: "center",
    editor: {
      type: "number",
      map_to: "duration",
      min: 0,
      max: 3650
    },
    template: function (task) {
      if (task.duration === 0) return "当天"
      return task.duration + "天"
    }
  },
  {
    name: "status",
    label: "执行情况",
    width: 100,
    align: "center",
    editor: {
      type: "select",
      map_to: "status",
      options: [
        { key: "not_started", label: "未开始" },
        { key: "in_progress", label: "进行中" },
        { key: "completed", label: "已完成" },
        { key: "on_hold", label: "已暂停" },
        { key: "cancelled", label: "已取消" }
      ]
    },
    template: function (task) {
      const statusMap = {
        'completed': '<span style="color: #67c23a;">✅ 已完成</span>',
        'in_progress': '<span style="color: #409eff;">🔄 进行中</span>',
        'not_started': '<span style="color: #909399;">📅 未开始</span>',
        'on_hold': '<span style="color: #e6a23c;">⏸️ 暂停</span>',
        'cancelled': '<span style="color: #f56c6c;">❌ 已取消</span>'
      }
      return statusMap[task.status] || '<span style="color: #909399;">未开始</span>'
    }
  },
  {
    name: "progress",
    label: "完成比例",
    width: 90,
    align: "center",
    editor: {
      type: "number",
      map_to: "progress",
      min: 0,
      max: 1
    },
    template: function (task) {
      const percent = Math.round(task.progress * 100)
      let color = '#909399'
      if (percent == 100) color = '#67c23a'
      else if (percent >= 10) color = '#409eff'

      return `<span style="color: ${color}; font-weight: bold;">${percent}%</span>`
    }
  },
  {
    name: "owner",
    label: "负责人",
    width: 90,
    align: "center",
    editor: ownerEditor,
    template: function (task) {
      return task.owner || '<span style="color: #c0c4cc;">-</span>'
    }
  },
  {
    name: "stakeholder",
    label: "相关方",
    width: 100,
    align: "center",
    editor: {
      type: "text",
      map_to: "stakeholder"
    },
    template: function (task) {
      return task.stakeholder || '<span style="color: #c0c4cc;">-</span>'
    }
  },
  {
    name: "predecessors",
    label: "前置任务",
    width: 150,
    align: "center",
    template: function (task) {
      if (task.predecessors && task.predecessors.length > 0) {
        const predecessorNames = task.predecessors.map(predId => {
          const predTask = gantt.getTask(predId)
          return predTask ? predTask.text : `任务${predId}`
        }).join(', ')
        return `<span style="color: #409eff;">${predecessorNames}</span>`
      }
      return '<span style="color: #c0c4cc;">-</span>'
    }
  },
  {
    name: "description",
    label: "任务描述",
    width: 200,
    editor: descriptionEditor,
    template: function (task) {
      const description = task.description || ''
      if (description) {
        // 如果description长度超过20个字符，显示省略号并在title中显示完整内容
        const displayText = description.length > 20 ? description.substring(0, 20) + '...' : description
        return `<span>${displayText}</span>`
      }
      return '<span style="color: #c0c4cc;">-</span>'
    }
  }
]

// 合并所有列（基础列 + 自定义列）
const getAllColumnsList = computed(() => {
  return [...allColumns, ...customColumns.value]
})

// 根据 visibleColumns 顺序排序的所有列（基础列 + 自定义列）
const sortedAllColumns = computed(() => {
  const columnOrder = visibleColumns.value
  // 合并所有列
  const allColumnsList = [...allColumns, ...customColumns.value]

  // 按照 visibleColumns 的顺序排序
  return allColumnsList.sort((a, b) => {
    const indexA = columnOrder.indexOf(a.name)
    const indexB = columnOrder.indexOf(b.name)
    // 如果都不在visibleColumns中，保持原顺序
    if (indexA === -1 && indexB === -1) return 0
    // 如果a不在visibleColumns中，b在前
    if (indexA === -1) return 1
    // 如果b不在visibleColumns中，a在前
    if (indexB === -1) return -1
    // 都在visibleColumns中，按照visibleColumns的顺序
    return indexA - indexB
  })
})

// 添加自定义列对话框
const showAddColumnDialog = ref(false)
const newColumnForm = ref({
  name: '',
  label: '',
  width: 100,
  align: 'center'
})

// 添加自定义列
const addCustomColumn = () => {
  if (!newColumnForm.value.name || !newColumnForm.value.label) {
    ElMessage.warning('请输入列名称和显示名称')
    return
  }

  // 检查列名是否已存在
  const exists = getAllColumnsList.value.some(col => col.name === newColumnForm.value.name)
  if (exists) {
    ElMessage.warning('该列名已存在')
    return
  }

  // 添加自定义列
  // 使用局部变量保存列名，避免闭包问题
  const columnName = newColumnForm.value.name
  const customColumn = {
    name: columnName,
    label: newColumnForm.value.label,
    width: newColumnForm.value.width || 100,
    align: newColumnForm.value.align || 'center',
    editor: {
      type: "text",
      map_to: columnName
    },
    template: function (task) {
      return task[columnName] || '<span style="color: #c0c4cc;">-</span>'
    },
    isCustom: true  // 标记为自定义列
  }

  customColumns.value.push(customColumn)
  visibleColumns.value.push(columnName)

  // 防止新加的字段内联编辑时显示undefined
  gantt.eachTask(function (task) {
    if (task[columnName] === undefined) {
      task[columnName] = ''
    }
  })

  showAddColumnDialog.value = false

  // 重置表单
  newColumnForm.value = {
    name: '',
    label: '',
    width: 100,
    align: 'center'
  }

  // 更新列显示
  updateColumnVisibility()
}

// 删除自定义列
const deleteCustomColumn = (columnName) => {
  ElMessageBox.confirm('确定要删除此自定义列吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = customColumns.value.findIndex(col => col.name === columnName)
    if (index !== -1) {
      customColumns.value.splice(index, 1)
      // 从可见列中移除
      const visibleIndex = visibleColumns.value.indexOf(columnName)
      if (visibleIndex !== -1) {
        visibleColumns.value.splice(visibleIndex, 1)
      }
      ElMessage.success('自定义列已删除')
      updateColumnVisibility()
    }
  }).catch(() => { })
}

// 生命周期钩子
onMounted(async () => {
  // 首先进行版本检查，如果版本不匹配会自动刷新页面
  await checkVersionAndRefresh()

  // 加载Grid宽度设置
  loadGridWidth()

  // 获取URL参数
  const params = new URLSearchParams(window.location.search)
  let code = params.get('code')
  urlParams.value = { code }

  let loginres;

  // 如果用户已登录则加载用户登录信息
  if (userInfo.value == null && getToken()) {
    loginres = await loadUserInfo();
  }

  if (code == null && loginres != undefined && loginres && loginres.data.length > 0) {
    code = loginres.data[0].code;
  }

  // 设置当前项目代码
  currentProjectCode.value = code || ''

  await loadInitialData(code)
  initGantt()

  // 初始化拖拽排序
  initColumnDragSort()

  // 监听窗口尺寸变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 清理Grid拖拽事件监听器
  if (isGridResizing.value) {
    document.removeEventListener('mousemove', handleGridResize)
    document.removeEventListener('mouseup', endGridResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
})



const contactService = () => {
  showContactDialog.value = true
}

// 处理从 UserCenter 打开支付对话框
const handleOpenPayment = (version) => {
  selectedUpgradeVersion.value = version
  paymentDialogVisible.value = true
}

// 处理从 UserCenter 打开联系客服对话框
const handleOpenContact = () => {
  showContactDialog.value = true
}

// 处理支付成功
const handlePaymentSuccess = () => {
  ElMessage.success('支付成功！刷新后生效')
}

const openHelp = () => {
  // 在新标签页打开帮助页面
  window.open('/help', '_blank')
}

const loadUserInfo = async () => {
  let res = await getUserProfile();
  if (res.code == 200) {
    userInfo.value = res.data;
    let projects = await load({ page: 1, limit: 100 });
    projectList.value = projects.data;
    return projects;
  }
}

// 处理窗口尺寸变化
const handleResize = () => {
  if (gantt && ganttContainer.value) {
    setTimeout(() => {
      gantt.setSizes()
      gantt.render()
    }, 100)
  }
}

// 监听字段显示变化
watch(visibleColumns, () => {
  // 确保甘特图已经初始化
  if (gantt && gantt.config && gantt.render) {
    updateColumnVisibility()
  }
}, { deep: true })

// 监听拖拽排序开关变化
watch(dragSortEnabled, (enabled) => {
  if (gantt && gantt.config) {
    if (enabled) {
      gantt.config.order_branch = true
      gantt.config.order_branch_free = true
      // 如果任务数量较多，使用marker模式提升性能
      if (tasks.value.length > 50) {
        gantt.config.order_branch = "marker"
      }
      ElMessage.success('拖拽排序已启用')
    } else {
      gantt.config.order_branch = false
      gantt.config.order_branch_free = false
      ElMessage.success('拖拽排序已禁用')
    }

    // 重新渲染甘特图以应用配置
    if (gantt.render) {
      gantt.render()
    }
  }
})

// 监听基线显示开关变化
watch(baselineVisible, (visible) => {
  if (gantt && gantt.render) {
    if (visible) {
      ElMessage.success('基线已显示')
    } else {
      ElMessage.success('基线已隐藏')
    }
    // 重新渲染基线图层
    gantt.render()
  }
})

// 加载初始数据
const loadInitialData = async (code = null) => {
  try {
    loading.value = true
    const data = await loadGanttData(code);
    if (data == null) {
      loading.value = false;
      ElMessage.error(`未能找到${code}对应的进度计划`)
      return;
    }
    tasks.value = data.tasks
    links.value = data.links
    projectInfo.value = data.projectInfo

    // 确保projectInfo有customColumns字段
    if (!projectInfo.value.customColumns) {
      projectInfo.value.customColumns = []
    }

    // 恢复自定义列（需要重新创建template函数）
    if (projectInfo.value.customColumns.length > 0) {
      customColumns.value = projectInfo.value.customColumns.map(col => ({
        ...col,
        template: function (task) {
          return task[col.name] || '<span style="color: #c0c4cc;">-</span>'
        }
      }))
    } else {
      customColumns.value = []
    }

    // 恢复可见字段配置
    if (projectInfo.value.visibleColumns && projectInfo.value.visibleColumns.length > 0) {
      visibleColumns.value = projectInfo.value.visibleColumns
    } else {
      // 使用默认配置
      visibleColumns.value = [...defaultVisibleColumns]
    }

    // 恢复视图模式配置
    if (projectInfo.value.viewMode) {
      viewMode.value = projectInfo.value.viewMode
    } else {
      viewMode.value = 'default'
    }

    document.title = `${projectInfo.value.name} - 星甘StarGantt | 免费在线甘特图工具 | 项目进度管理软件`

    // 初始化权限配置
    projectPermission.value = {
      visibilityScope: projectInfo.value.visibilityScope || 3,
      permissionUserIds: projectInfo.value.permissionUserIds || [],
      permissionType: projectInfo.value.permissionType || 'VIEW'
    }

    // 加载已选用户信息
    loadSelectedUsers()

    // 更新项目负责人列表
    updateProjectOwners()

    // 检查收藏状态
    checkStarStatus()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
    // 延迟执行，确保DOM已经渲染
    nextTick(() => {
      updateColumnVisibility()
    })
  }
}

// 初始化甘特图
const initGantt = () => {
  nextTick(() => {
    // 基础配置
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.xml_date = '%Y-%m-%d'  // 添加XML日期格式
    gantt.config.api_date = '%Y-%m-%d %H:%i:%s'  // 添加API日期格式
    gantt.config.autosize = false  // 关闭自动调整大小，使用固定高度
    gantt.config.row_height = 28
    gantt.config.task_height = 20
    gantt.config.grid_width = gridWidth.value
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.drag_progress = true
    gantt.config.sort = true
    gantt.config.scrollY = "y"     // 启用垂直滚动
    gantt.config.scrollX = "x"     // 启用水平滚动

    // 启用行拖动排序功能
    gantt.config.order_branch = true        // 启用同级任务拖动排序
    gantt.config.order_branch_free = true   // 启用跨级任务拖动排序

    // 如果任务数量较多，使用marker模式提升性能
    if (tasks.value.length > 50) {
      gantt.config.order_branch = "marker"
    }

    // 时间轴列宽配置
    gantt.config.min_column_width = 30  // 最小列宽（像素）
    gantt.config.subscales = []         // 子刻度配置

    //自定义布局，只有甘特图timeline部分需要横向滚动条
    gantt.config.layout = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", id: "grid", width: gridWidth.value, scrollY: "scrollVer" },
            {
              rows: [
                { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                { view: "scrollbar", scroll: "x", id: "scrollHor" }
              ]
            },
            { view: "scrollbar", scroll: "y", id: "scrollVer" }
          ]
        }
      ]
    };

    // 时间刻度配置
    setTimeScale(viewMode.value)

    // 任务类型配置
    gantt.config.types = {
      'task': 'task',
      'project': 'project',
      'milestone': 'milestone'
    }

    // 层级结构优化
    gantt.config.open_tree_initially = true  // 默认展开树形结构
    gantt.config.auto_scheduling = false     // 关闭自动调度
    gantt.config.auto_scheduling_strict = false
    gantt.config.work_time = false            // 禁用工作时间，如果启用则不能选则周末等
    gantt.config.correct_work_time = false    // 禁用调整工作时间

    // 启用内联编辑功能
    gantt.config.readonly = false            // 保持可编辑状态
    gantt.config.drag_links = true          // 启用拖拽创建依赖
    gantt.config.details_on_dblclick = false // 禁用双击打开详情，使用自定义编辑对话框
    gantt.config.inline_editors_date_format = "%Y-%m-%d"  // 日期编辑器格式

    // 防止列宽度自动调整
    gantt.config.fit_tasks = false          // 禁用任务自动适应
    gantt.config.grid_elastic_columns = false // 禁用弹性列宽

    gantt.config.show_markers = true //显示标记

    // 禁用内置弹窗，使用自定义编辑对话框
    gantt.config.lightbox = {
      sections: []  // 清空所有内置编辑器配置
    }

    // 跟踪当前悬停的列名
    let hoveredColumn = null
    window.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('[data-column-name]')
      hoveredColumn = cell ? cell.getAttribute('data-column-name') : null
    })

    gantt.templates.tooltip_text = (start, end, task) => {
      // 当有内联编辑框时，不显示tooltip
      const editorState = gantt.ext.inlineEditors.getState();
      if (editorState.id) {
        return '';
      }
      // 当光标在Id列时，不显示tooltip
      if (hoveredColumn === 'id') {
        return '';
      }
      return `<b>任务:</b> ${task.text}
      <br/><b>开始时间:</b> ${dayjs(task.start_date).format('YYYY-MM-DD')}（${'日一二三四五六'[dayjs(task.start_date).day()]}）
      <br/><b>结束时间:</b> ${dayjs(task.end_date).format('YYYY-MM-DD')}（${'日一二三四五六'[dayjs(task.end_date).day()]}）
      <br/><b>进度:</b> ${task.progress * 100}%
      <br/><b>负责人:</b> ${task.owner}
      <br/><b>描述:</b> ${(task.description || '').replace(/\n/g, '<br/>')}`;
    };

    // 网格行样式
    gantt.templates.grid_row_class = function (start, end, task) {
      let css = ""
      if (task.type === 'project') {
        css += "gantt_project_row "
      }
      // 添加背景色样式
      if (task.backgroundColor) {
        css += task.backgroundColor + ' '
      }
      return css
    }

    // 任务条样式 - 根据背景色设置任务条颜色
    gantt.templates.task_class = function (start, end, task) {
      let css = ""
      if (task.backgroundColor) {
        css += task.backgroundColor + '_bar '
      }
      return css
    }
    // 时间轴列样式 - 周末区分
    gantt.templates.timeline_cell_class = function (task, date) {
      let css = ""
      const day = date.getDay()

      // 周六 (6) 和周日 (0) 添加周末样式
      if (day === 0 || day === 6) {
        css += "gantt_saturday "
      }

      return css
    }

    // 去掉默认的文件夹和文件图标，只保留折叠按钮
    gantt.templates.grid_folder = function (item) {
      return "" // 去掉文件夹图标
    }

    gantt.templates.grid_file = function (item) {
      return "" // 去掉文件图标
    }

    gantt.templates.grid_blank = function (item) {
      return "" // 保持空白
    }

    gantt.plugins({
      keyboard_navigation: true,
      undo: true,
      tooltip: true,
      marker: true
    });

    // 添加快捷键ctrl+s保存项目
    gantt.addShortcut("ctrl+s", function (e) {
      saveProject();
    });

    // 添加快捷键ctrl+z撤销
    gantt.addShortcut("ctrl+z", function (e) {
      gantt.undo();
    });

    // 添加快捷键ctrl+q新建任务
    gantt.addShortcut("ctrl+q", function (e) {
      addTask();
    });

    gantt.attachEvent("onContextMenu", function (id, linkId, e) {
      // 如果右键点击的是任务（id存在）
      if (id) {
        console.log('右键点击任务:', id)
        const task = gantt.getTask(id)
        if (task) {
          currentTask.value = task

          // 获取菜单位置
          let x = e.clientX
          let y = e.clientY

          contextMenuX.value = x
          contextMenuY.value = y
          contextMenuVisible.value = true

          // 菜单显示后调整位置，避免超出屏幕
          nextTick(() => {
            const menu = document.querySelector('.gantt-context-menu')
            if (menu) {
              if (x + menu.offsetWidth > window.innerWidth) {
                contextMenuX.value = x - menu.offsetWidth
              }
              if (y + menu.offsetHeight > window.innerHeight) {
                contextMenuY.value = y - menu.offsetHeight
              }
            }
          })
        }
      }

      e.preventDefault()
      return true;
    });

    gantt.attachEvent("onTaskLoading", function (task) {
      task.planned_start = gantt.date.parseDate(task.planned_start, "xml_date");
      task.planned_end = gantt.date.parseDate(task.planned_end, "xml_date");
      return true;
    });

    // 事件监听
    gantt.attachEvent("onTaskClick", (id, e) => {
      currentTask.value = gantt.getTask(id)
      return true
    })

    //拖动链接甘特图两个任务时建立关系
    gantt.attachEvent("onAfterLinkAdd", function (id, link) {
      console.log('onAfterLinkAdd:', id, link)
      //判断link是否存在
      if (links.value.find(l => l.id == id)) {
        return
      }

      const newlink = {
        id: getNextLinkId(),
        source: parseInt(link.source),
        target: parseInt(link.target),
        type: "0"  // 完成-开始关系
      }
      //更新task的前置任务
      const task = tasks.value.find(t => t.id == newlink.target)
      if (task != null && task.predecessors != null && task.predecessors.indexOf(newlink.source) == -1) {
        task.predecessors.push(newlink.source)
      }

      // 添加到links数组
      links.value.push(newlink)
    })

    // 添加双击事件监听
    gantt.attachEvent("onTaskDblClick", (id, e) => {
      // 如果存在inline editors扩展，先隐藏编辑器
      if (gantt.ext && gantt.ext.inlineEditors && typeof gantt.ext.inlineEditors.hide === 'function') {
        gantt.ext.inlineEditors.hide()
      }
      const task = gantt.getTask(id)
      openEditDialog(task)
      return false  // 阻止默认行为
    })

    // 添加行拖动排序事件监听
    gantt.attachEvent("onBeforeRowDragEnd", (id, parent, tindex) => {
      console.log('拖动排序前:', { id, parent, tindex })

      // 检查是否启用拖拽排序
      if (!dragSortEnabled.value) {
        ElMessage.warning('拖拽排序功能已禁用')
        return false
      }

      // 获取被拖动的任务
      const draggedTask = gantt.getTask(id)

      // 可以添加更多限制逻辑
      // 例如：防止里程碑任务被拖拽到项目任务下面
      if (draggedTask.type === 'milestone' && parent !== draggedTask.parent) {
        ElMessage.warning('里程碑任务不能移动到其他父任务下')
        return false
      }

      return true  // 允许拖动
    })

    gantt.attachEvent("onRowDragEnd", (id, target) => {


      // 更新本地任务数组的顺序和 parent
      updateTaskOrderInArray(id, target)

      ElMessage.success('任务顺序已调整')
    })

    // 添加行拖动开始事件
    gantt.attachEvent("onRowDragStart", (id, target, e) => {
      console.log('开始拖动任务:', id)

      // 检查是否启用拖拽排序
      if (!dragSortEnabled.value) {
        return false
      }

      return true
    })

    gantt.attachEvent("onBeforeTaskChanged", (id, mode, oldTask) => {
      // 保存修改前的任务快照，供 onAfterTaskUpdate 做级联计算
      if (!taskBeforeUpdate.value) {
        const index = tasks.value.findIndex(t => t.id == id)
        if (index !== -1) {
          taskBeforeUpdate.value = JSON.parse(JSON.stringify(tasks.value[index]))
          console.log('[onBeforeTaskChanged] 保存快照:', tasks.value[index].text,
            '结束=', tasks.value[index].end_date,
            '开始=', tasks.value[index].start_date)
        }
      }
      return true;
    })

    gantt.attachEvent("onAfterTaskUpdate", (id, task) => {
      // 甘特图里面更新后，更新响应式数组中的任务
      const index = tasks.value.findIndex(t => t.id == id)
      if (index !== -1) {
        //重新计算父级任务的progress
        recalculateParentTaskProgress(task)
        // 用修改前的快照做级联计算（taskBeforeUpdate 在 onBeforeTaskChanged 中保存）
        if (taskBeforeUpdate.value) {
          updateCascade(taskBeforeUpdate.value, task)
          taskBeforeUpdate.value = null
        }
        // 进度/状态联动
        if (task.progress > 0 && task.status == 'not_started') {
          task.status = 'in_progress'
        }
        if (task.progress == 1) {
          task.status = 'completed'
        }
        if (task.status == 'completed' && task.progress < 1) {
          task.progress = 1
        }
        tasks.value[index] = { ...tasks.value[index], ...task }
      }
    })


    gantt.attachEvent("onAfterTaskAdd", (id, task) => {
      addTaskToArray(task)
    })

    gantt.attachEvent("onAfterTaskDelete", (id, task) => {
      ElMessage.success(`已删除任务: ${task.text}`)
      removeTaskFromArray(id)
    })

    // 在甘特图渲染后更新图层
    gantt.attachEvent("onGanttRender", () => {
      setTimeout(renderCustomTaskLayer, 0)
    })

    // 在任务更新后更新图层
    gantt.attachEvent("onAfterTaskUpdate", () => {
      setTimeout(renderCustomTaskLayer, 0)
    })

    // 在滚动后更新图层
    gantt.attachEvent("onGanttScroll", () => {
      renderCustomTaskLayer()
    })

    // 内联编辑保存事件
    var inlineEditors = gantt.ext.inlineEditors;
    inlineEditors.attachEvent("onSave", function (state) {
      console.log('[inlineEditOnSave] 完整 state 对象:', JSON.stringify(state))
      inlineEditOnSave(state)
    });

    const editorInstances = new Map()

    gantt.config.editor_types.custom_editor = {
      show: function (id, column, config, placeholder) {
        const task = gantt.getTask(id)
        const currentValue = task.owner ? task.owner.split(',').map(v => v.trim()).filter(v => v) : []
        const selectedValues = ref([...currentValue])

        const container = document.createElement('div')
        container.style.width = '100%'
        container.setAttribute('data-editor-id', id)
        placeholder.innerHTML = ''
        placeholder.appendChild(container)

        const OwnerSelect = defineComponent({
          setup() {
            return () => h(ElSelect, {
              modelValue: selectedValues.value,
              multiple: true,
              filterable: true,
              allowCreate: true,
              reserveKeyword: false,
              placeholder: '请选择或输入负责人',
              style: { width: '200px' },
              'onUpdate:modelValue': (val) => { selectedValues.value = val }
            }, () => projectOwners.value.map(item => h(ElOption, { key: item, label: item, value: item })))
          }
        })

        const app = createApp(OwnerSelect)
        if (vm && vm.appContext) {
          app._context = vm.appContext
        }
        app.mount(container)
        nextTick(() => {
          const input = container.querySelector('input')
          if (input) {
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') gantt.ext.inlineEditors.hide()
            })
          }
        })

        editorInstances.set(id, { app, container, selectedValues })
      },
      hide: function () {
        gantt.render()
      },
      set_value: function (value, id, column, node) {
        const instance = editorInstances.get(id)
        if (!instance) return
        const values = value ? value.split(',').map(v => v.trim()).filter(v => v) : []
        instance.selectedValues.value = values
      },
      get_value: function (id, column, node) {
        const task = gantt.getTask(id)
        const instance = editorInstances.get(id)
        if (!instance) {
          return task.owner || ''
        }
        const values = instance.selectedValues.value

        //如果有新加的项，添加到项目负责人列表中
        values.forEach(value => {
          if (!projectOwners.value.includes(value)) {
            projectOwners.value.push(value)
          }
        })

        task.owner = values.join(',')
        return task.owner
      },
      is_changed: function (value, id, column, node) {
        return true
      },
      is_valid: function (value, id, column, node) {
        return true
      },
      save: function (id, column, node) {
        const instance = editorInstances.get(id)
        if (instance) {
          instance.app.unmount()
          editorInstances.delete(id)
        }
      },
      focus: function (node) {
        let targetContainer = null
        let targetId = null
        if (node && node.hasAttribute && node.hasAttribute('data-editor-id')) {
          targetId = node.getAttribute('data-editor-id')
          targetContainer = node
        } else if (node) {
          const container = node.querySelector('[data-editor-id]')
          if (container) {
            targetId = container.getAttribute('data-editor-id')
            targetContainer = container
          }
        }
        if (targetId && targetContainer) {
          const inputEl = targetContainer.querySelector('input')
          if (inputEl) {
            inputEl.focus()
          }
        }
      }
    }

    // 多行文本编辑器（用于description）
    const textareaInstances = new Map()

    // 强制获取焦点，使用多层保障机制
    const forceFocusTextarea = (textarea) => {
      if (!textarea || !document.body.contains(textarea)) return

      textarea.focus({ preventScroll: false })

      // 多次延迟确保焦点不被抢占
      const delays = [0, 10, 30, 60, 100]
      delays.forEach(delay => {
        setTimeout(() => {
          if (textarea && document.body.contains(textarea) && document.activeElement !== textarea) {
            textarea.focus({ preventScroll: false })
          }
        }, delay)
      })
    }

    // 使用 MutationObserver 监听 textarea 出现
    const observeAndFocusTextarea = (container) => {
      // 先检查是否已存在
      const existingTextarea = container.querySelector('textarea')
      if (existingTextarea) {
        forceFocusTextarea(existingTextarea)
        return
      }

      // 使用 MutationObserver 监听 textarea 的出现
      const observer = new MutationObserver((mutations, obs) => {
        const textarea = container.querySelector('textarea')
        if (textarea) {
          obs.disconnect()
          forceFocusTextarea(textarea)
        }
      })

      observer.observe(container, {
        childList: true,
        subtree: true
      })

      // 超时后断开观察器
      setTimeout(() => observer.disconnect(), 500)
    }

    gantt.config.editor_types.textarea_editor = {
      show: function (id, column, config, placeholder) {
        const task = gantt.getTask(id)
        const currentValue = ref(task.description || '')

        const container = document.createElement('div')
        container.style.width = '100%'
        container.setAttribute('data-editor-id', id)
        placeholder.innerHTML = ''
        placeholder.appendChild(container)

        const TextareaInput = defineComponent({
          setup() {
            return () => h(ElInput, {
              type: 'textarea',
              modelValue: currentValue.value,
              rows: 3,
              placeholder: '提示:Shift+回车可换行',
              style: { width: '300px' },
              'onUpdate:modelValue': (val) => { currentValue.value = val },
              onKeydown: (e) => {
                if (e.key === 'Escape') gantt.ext.inlineEditors.hide()
              }
            })
          }
        })

        const app = createApp(TextareaInput)
        if (vm && vm.appContext) {
          app._context = vm.appContext
        }
        app.mount(container)

        textareaInstances.set(id, { app, container, currentValue })

        // 使用 MutationObserver 监听并获取焦点
        observeAndFocusTextarea(container)
      },
      hide: function () {
        gantt.render()
      },
      set_value: function (value, id, column, node) {
        const instance = textareaInstances.get(id)
        if (!instance) return
        instance.currentValue.value = value || ''
      },
      get_value: function (id, column, node) {
        const task = gantt.getTask(id)
        const instance = textareaInstances.get(id)
        if (!instance) {
          return task.description || ''
        }
        task.description = instance.currentValue.value
        return task.description
      },
      is_changed: function (value, id, column, node) {
        return true
      },
      is_valid: function (value, id, column, node) {
        return true
      },
      save: function (id, column, node) {
        const instance = textareaInstances.get(id)
        if (instance) {
          instance.app.unmount()
          textareaInstances.delete(id)
        }
      },
      focus: function (node) {
        const container = node.querySelector ? node.querySelector('[data-editor-id]') : null
        if (container) {
          const textarea = container.querySelector('textarea')
          if (textarea) {
            forceFocusTextarea(textarea)
          } else {
            observeAndFocusTextarea(container)
          }
        }
      }
    }

    // 初始化甘特图
    gantt.init(ganttContainer.value)

    // 设置甘特图高度以支持滚动
    setTimeout(() => {
      gantt.setSizes()
      gantt.render()

      // 初始化完成后，根据可见列调整Grid宽度
      const initialVisibleCols = allColumns.filter(col => visibleColumns.value.includes(col.name))
      adjustGridWidthByColumns(initialVisibleCols)

      // 初始渲染自定义图层
      renderCustomTaskLayer()
    }, 100)

    // 加载数据
    loadData()

    // 添加Grid分割线拖拽手柄
    gantt.attachEvent("onGanttRender", () => {
      addGridResizeHandle()
    })

    // 初始添加拖拽手柄
    setTimeout(() => {
      addGridResizeHandle()
      // 确保图层在所有初始化完成后渲染
      renderCustomTaskLayer()
    }, 500)

    // 添加全局点击事件，关闭右键菜单
    document.addEventListener('click', () => {
      contextMenuVisible.value = false
    })
  })
}

// 重新计算父级任务的progress
const recalculateParentTaskProgress = (task) => {
  const parentTask = tasks.value.find(t => t.id == task.parent)
  if (parentTask) {
    var oldtask = { ...parentTask }
    let childTasks = tasks.value.filter(t => t.parent == parentTask.id)
    let childTasksProgress = childTasks.reduce((sum, t) => sum + Number(t.progress || 0), 0)
    parentTask.progress = childTasksProgress / childTasks.length

    syncTaskProgressAndStatus(oldtask, parentTask)
  }
}

/**
 * 同步任务进度和状态
 * @param oldtask 旧任务对象
 * @param task 新任务对象
 */
const syncTaskProgressAndStatus = (oldtask, task) => {
  if (oldtask.progress == task.progress && oldtask.status == task.status) {
    return;
  }
  let changeProcess = false
  if (oldtask.progress != task.progress) {
    changeProcess = true
  } else {
    changeProcess = false
  }

  if (changeProcess && task.progress > 0 && task.status == 'not_started') {
    task.status = 'in_progress'
  }
  if (changeProcess && task.progress == 1) { //直接进度调整为100%，则状态调整为完成
    task.status = 'completed'
  }

  if (!changeProcess && task.progress < 1 && task.status == 'completed') { //调整进度为完成，则百分比调整为100%
    task.progress = 1
  }
}

/**
 * 内联编辑保存时触发
 * 仅做必要处理，级联更新统一由 onAfterTaskUpdate 处理
 */
const inlineEditOnSave = (state) => {
  const { id, columnName, oldValue, newValue } = state
  if (oldValue == newValue) {
    return;
  }
  // 内联编辑保存后，Gantt 内部已更新数据，无需额外操作
}

// 设置时间刻度
const setTimeScale = (mode) => {
  switch (mode) {
    case 'day':
      gantt.config.scale_unit = 'day'
      gantt.config.date_scale = '%Y-%m-%d'
      gantt.config.min_column_width = 80  // 日视图：每天80像素
      gantt.config.subscales = [
        { unit: 'hour', step: 6, date: '%H:%i' }
      ]
      break
    case 'default':
      gantt.config.scale_unit = 'month'
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      gantt.config.min_column_width = 30  // 默认视图：每天30像素
      gantt.config.subscales = [
        {
          unit: 'day', step: 1, date: '%d', css: function (date) {
            let css = ""
            const day = date.getDay()

            // 周六 (6) 和周日 (0) 添加周末样式
            if (day === 0 || day === 6) {
              css += "gantt_scale_saturday "
            }

            return css

          }
        }
      ]
      break
    case 'month':
      gantt.config.scale_unit = 'month'
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        return `${year}年${month}月`
      }
      gantt.config.min_column_width = 100  // 月视图：每月100像素
      gantt.config.subscales = [
        {
          unit: 'week',
          step: 1,
          template: function (date) {
            const weekOfMonth = getWeekOfMonth(date)
            return `第${weekOfMonth}周`
          }
        }
      ]
      break
    case 'quarter':
      gantt.config.scale_unit = 'quarter'
      // 使用自定义模板显示季度
      gantt.templates.date_scale = function (date) {
        const year = date.getFullYear()
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${year}年第${quarter}季度`
      }
      gantt.config.min_column_width = 150  // 季度视图：每季度150像素
      gantt.config.subscales = [
        {
          unit: 'month',
          step: 1,
          template: function (date) {
            const month = date.getMonth() + 1
            return `${month}月`
          }
        }
      ]
      break
  }
}

// 加载数据
const loadData = () => {
  // 同步前置任务和链接
  syncPredecessorsWithLinks()

  gantt.parse({
    data: tasks.value,
    links: links.value
  })

  //设置今日线
  var todayMarker = gantt.addMarker({  /*!*/
    start_date: new Date(new Date().setHours(0, 0, 0, 0)), // 设置为当天的0点0分0秒
    css: "today",
    text: "今天",
    title: dayjs(new Date()).format('YYYY-MM-DD')
  });

  // 更新项目负责人列表
  updateProjectOwners()

  // 应用保存的视图模式
  if (viewMode.value) {
    setTimeScale(viewMode.value)
  }
}

// 同步前置任务和链接
const syncPredecessorsWithLinks = () => {
  // 清空现有链接，重新根据前置任务生成
  const newLinks = []
  let linkId = 1

  // 过滤掉无效任务
  const validTasks = tasks.value.filter(t => t && t.id)
  
  validTasks.forEach(task => {
    if (task.predecessors && Array.isArray(task.predecessors) && task.predecessors.length > 0) {
      task.predecessors.forEach(predId => {
        // 检查前置任务是否存在
        const predTask = validTasks.find(t => t.id === predId)
        if (predTask) {
          newLinks.push({
            id: linkId++,
            source: predId,
            target: task.id,
            type: "0"
          })
        }
      })
    }
  })

  // 更新links数组
  links.value = newLinks
}

// 切换视图
const changeView = (mode) => {
  viewMode.value = mode
  setTimeScale(mode)
  gantt.render()
}

// 计算工期（基于开始时间和完成时间）- 编辑任务
const calculateDurationForEdit = () => {
  if (editTask.value.start_date && editTask.value.end_date) {
    const startDate = new Date(editTask.value.start_date)
    const endDate = new Date(editTask.value.end_date)

    if (endDate > startDate) {
      // 计算天数差异（包含小数）
      const timeDiff = endDate.getTime() - startDate.getTime()
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
      editTask.value.duration = Math.max(1, Math.round(daysDiff)) // 保留1位小数，最小0.1天
    } else if (endDate <= startDate) {
      // 如果结束时间不晚于开始时间，设置为最小工期
      editTask.value.duration = 0.1
    }
  }
}

// 计算结束时间（基于开始时间和工期）- 编辑任务
const calculateEndDateForEdit = () => {
  if (editTask.value.start_date && editTask.value.duration) {
    const startDate = new Date(editTask.value.start_date)
    const endDate = new Date(startDate.getTime() + editTask.value.duration * 24 * 60 * 60 * 1000)
    editTask.value.end_date = endDate
  }
}

// 添加任务
const addTask = () => {
  const startDate = currentTask.value ? currentTask.value.end_date : new Date()  //如果选中了，则直接用选中任务的结束日期
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 默认3天后

  const task = {
    id: getNextId(),
    text: '',
    start_date: dayjs(startDate).format('YYYY-MM-DD'),
    end_date: dayjs(endDate).format('YYYY-MM-DD'),
    planned_start: '',
    planned_end: '',
    duration: 3,
    progress: 0,
    type: 'task',
    parent: currentTask.value ? currentTask.value.parent : 0,
    status: 'not_started',
    owner: '',
    stakeholder: '',
    description: '',
    predecessors: [],
    backgroundColor: ''
  }

  // 初始化自定义列字段
  customColumns.value.forEach(col => {
    task[col.name] = ''
  })

  gantt.addTask(task, currentTask.value ? currentTask.value.parent : 0)

  if (currentTask.value) {
    // 将新任务插入到tasks数组中选中任务的下一个位置
    const taskIndex = tasks.value.findIndex(t => t.id == task.id)
    if (taskIndex !== -1) {
      // 从原位置移除
      const [newTaskObj] = tasks.value.splice(taskIndex, 1)
      // 插入到选中任务的下一个位置
      tasks.value.splice(currentTask.value.$index + 1, 0, newTaskObj)

      // 重新加载甘特图数据以更新显示顺序
      gantt.clearAll()
      loadData()
    }
  }
  //定位到最新插入的任务并聚焦文本列
  gantt.showTask(task.id)

  // 聚焦文本列
  setTimeout(() => {
    const taskRow = document.querySelector(`.gantt_row[task_id="${task.id}"]`)
    if (taskRow) {
      const textCell = taskRow.querySelector('.gantt_cell:nth-child(2)')
      if (textCell) {
        textCell.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        setTimeout(() => {
          const input = document.querySelector('.gantt_grid input')
          if (input) {
            input.focus()
            input.select()
          }
        }, 100)
      }
    }
  }, 300)

  // 根据前置任务创建链接
  createLinksFromPredecessors(task.id, task.predecessors)

  // 更新项目负责人列表
  updateProjectOwners()
}

// 打开编辑任务对话框
const openEditDialog = (task) => {
  // 确保开始日期格式正确
  let startDate
  if (task.start_date) {
    if (typeof task.start_date === 'string') {
      startDate = new Date(task.start_date)
    } else if (task.start_date instanceof Date) {
      startDate = task.start_date
    } else {
      startDate = new Date()
    }
  } else {
    startDate = new Date()
  }

  // 确保结束日期格式正确
  let endDate
  if (task.end_date) {
    if (typeof task.end_date === 'string') {
      endDate = new Date(task.end_date)
    } else if (task.end_date instanceof Date) {
      endDate = task.end_date
    } else {
      // 如果没有结束日期，根据开始日期和工期计算
      const duration = task.duration || 1
      endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)
    }
  } else {
    // 如果没有结束日期，根据开始日期和工期计算
    const duration = task.duration || 1
    endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)
  }

  // 处理负责人数据，将逗号分隔的字符串转换为数组
  let ownerValue = task.owner || ''
  let ownerArray = []
  if (typeof ownerValue === 'string' && ownerValue.includes(',')) {
    ownerArray = ownerValue.split(',').map(owner => owner.trim()).filter(owner => owner)
  } else if (Array.isArray(ownerValue)) {
    ownerArray = ownerValue
  } else if (ownerValue) {
    ownerArray = [ownerValue]
  }

  editTask.value = {
    id: task.id,
    text: task.text || '',
    start_date: startDate,
    end_date: endDate,
    planned_start: task.planned_start || '',
    planned_end: task.planned_end || '',
    duration: task.duration || 1,
    progress: task.progress || 0,
    type: task.type || 'task',
    parent: task.parent || 0,
    status: task.status || 'not_started',
    owner: ownerArray,
    stakeholder: task.stakeholder || '',
    description: task.description || '',
    predecessors: task.predecessors || [],
    backgroundColor: task.backgroundColor || '',
    stage: task.stage || ''
  }

  //将自定义列字段复制到编辑任务表单
  customColumns.value.forEach(col => {
    editTask.value[col.name] = task[col.name] || ''
  })

  showEditDialog.value = true
}

// 更新任务
const updateTask = () => {
  if (!editTask.value.text) {
    ElMessage.warning('请输入任务名称')
    return
  }

  // 处理负责人数据，将数组转换为逗号分隔的字符串
  let ownerValue = editTask.value.owner
  if (Array.isArray(ownerValue)) {
    ownerValue = ownerValue.join(', ')
  }

  const updatedTask = {
    id: editTask.value.id,
    text: editTask.value.text,
    start_date: editTask.value.start_date,
    end_date: editTask.value.end_date,
    planned_start: editTask.value.planned_start,
    planned_end: editTask.value.planned_end,
    duration: editTask.value.duration,
    progress: editTask.value.progress,
    type: editTask.value.type,
    parent: editTask.value.parent,
    status: editTask.value.status,
    owner: ownerValue,
    stakeholder: editTask.value.stakeholder,
    description: editTask.value.description,
    predecessors: editTask.value.predecessors || [],
    backgroundColor: editTask.value.backgroundColor || '',
    stage: editTask.value.stage || ''
  }

  // 如果选择了阶段，自动设置对应的背景色
  if (updatedTask.stage) {
    const stageConfig = projectStages.find(s => s.name === updatedTask.stage)
    if (stageConfig) {
      updatedTask.backgroundColor = stageConfig.backgroundColor
    }
  }

  //将自定义列字段复制到更新任务表单
  customColumns.value.forEach(col => {
    updatedTask[col.name] = editTask.value[col.name] || ''
  })

  try {

    // 获取原任务
    const originalTask = gantt.getTask(editTask.value.id)
    const newPredecessors = updatedTask.predecessors || []

    // 更新前置任务链接
    updateTaskLinks(editTask.value.id, newPredecessors)

    syncTaskProgressAndStatus(originalTask, updatedTask)

    // 更新甘特图中的任务
    gantt.updateTask(editTask.value.id, updatedTask)

    // 更新项目负责人列表
    updateProjectOwners()

    showEditDialog.value = false
    ElMessage.success('任务更新成功')

    // 强制重新渲染甘特图
    setTimeout(() => {
      gantt.render()
    }, 100)
  } catch (error) {
    console.error('更新任务失败:', error)
    ElMessage.error('更新任务失败: ' + error.message)
  }
}

// 级联更新任务
const updateCascade = (originalTask, updatedTask) => {
  if (!cascade.value) return;

  const updatedTaskIds = []

  console.log('[updateCascade] 被调用:', originalTask.text,
    '| 原结束=', originalTask.end_date,
    '| 新结束=', updatedTask.end_date,
    '| 原开始=', originalTask.start_date,
    '| 新开始=', updatedTask.start_date)

  //如果改变了结束日期，则更新所有的后续任务开始和结束日期
  // 统一转成 YYYY-MM-DD 字符串比较，避免时区问题
  const origEndDateStr = originalTask.end_date ? dayjs(originalTask.end_date).format('YYYY-MM-DD') : null
  const updatedEndDateStr = updatedTask.end_date ? dayjs(updatedTask.end_date).format('YYYY-MM-DD') : null
  if (origEndDateStr && updatedEndDateStr && origEndDateStr !== updatedEndDateStr) {
    // 用 startOf('day') 对齐，避免时区导致 diff 多算一天
    // 统一用 YYYY-MM-DD 字符串计算 dateDiff，避免时区偏移
    const oldDateStr = dayjs(originalTask.end_date).format('YYYY-MM-DD')
    const newDateStr = dayjs(updatedTask.end_date).format('YYYY-MM-DD')
    const dateDiff = dayjs(newDateStr).diff(dayjs(oldDateStr), 'day')
    console.log('[updateCascade] 结束日期变化 dateDiff=', dateDiff,
      '| 查找', updatedTask.id, '的后继任务, links数量=', links.value.length)
    let successors = getAllSuccessors(updatedTask.id, links.value)
    console.log('[updateCascade] 找到后继任务 IDs:', successors)
    successors.forEach(successorId => {
      let index = tasks.value.findIndex(t => t.id === successorId)
      if (index !== -1) {
        console.log('[updateCascade] 平移任务:', tasks.value[index].text,
          '原开始=', tasks.value[index].start_date,
          '新开始=', dayjs(tasks.value[index].start_date).add(dateDiff, 'day').format('YYYY-MM-DD'))
        tasks.value[index].start_date = dayjs(tasks.value[index].start_date).add(dateDiff, 'day').toDate()
        tasks.value[index].end_date = dayjs(tasks.value[index].end_date).add(dateDiff, 'day').toDate()
        updatedTaskIds.push(successorId)
      }
    })
  } else {
    console.log('[updateCascade] 结束日期无变化，跳过')
  }

  // 如果改变了开始日期，则更新所有的前置任务开始和结束日期
  // 统一转成 YYYY-MM-DD 字符串比较，避免时区问题
  const origStartDateStr = originalTask.start_date ? dayjs(originalTask.start_date).format('YYYY-MM-DD') : null
  const updatedStartDateStr = updatedTask.start_date ? dayjs(updatedTask.start_date).format('YYYY-MM-DD') : null
  if (origStartDateStr && updatedStartDateStr && origStartDateStr !== updatedStartDateStr) {
    // 统一用 YYYY-MM-DD 字符串计算 dateDiff，避免时区偏移
    const oldDateStr = dayjs(originalTask.start_date).format('YYYY-MM-DD')
    const newDateStr = dayjs(updatedTask.start_date).format('YYYY-MM-DD')
    const dateDiff = dayjs(newDateStr).diff(dayjs(oldDateStr), 'day')
    let predecessors = getAllPredecessors(updatedTask.id, links.value)
    predecessors.forEach(predecessorId => {
      let index = tasks.value.findIndex(t => t.id === predecessorId)
      if (index !== -1) {
        tasks.value[index].start_date = dayjs(tasks.value[index].start_date).add(dateDiff, 'day').toDate()
        tasks.value[index].end_date = dayjs(tasks.value[index].end_date).add(dateDiff, 'day').toDate()
        updatedTaskIds.push(predecessorId)
      }
    })
  }

  // 同步更新到甘特图内部数据
  updatedTaskIds.forEach(taskId => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && gantt.isTaskExists(taskId)) {
      gantt.updateTask(taskId, task)
    }
  })

  setTimeout(() => {
    gantt.render()
  }, 100)

}

// 设置任务背景色
const setTaskBackgroundColor = (colorValue) => {
  if (!currentTask.value) {
    ElMessage.warning('请先选择一个任务')
    return
  }

  try {
    // 更新任务的背景色属性
    const task = gantt.getTask(currentTask.value.id)
    task.backgroundColor = colorValue

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].backgroundColor = colorValue
    }

    // 关闭所有菜单
    contextMenuVisible.value = false

    const colorName = backgroundColors.find(c => c.css === colorValue || c.value === colorValue)?.name || '自定义'
    ElMessage.success(`已设置任务背景色为${colorName}`)
  } catch (error) {
    console.error('设置背景色失败:', error)
    ElMessage.error('设置背景色失败')
  }
}

// 设置任务阶段（不同阶段用不同背景色标记）
const setTaskStage = (stage) => {
  if (!currentTask.value) {
    ElMessage.warning('请先选择一个任务')
    return
  }

  try {
    // 更新任务的阶段属性
    const task = gantt.getTask(currentTask.value.id)
    task.stage = stage.name
    task.backgroundColor = stage.backgroundColor

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].stage = stage.name
      tasks.value[taskIndex].backgroundColor = stage.backgroundColor
    }

    // 关闭所有菜单
    contextMenuVisible.value = false

    ElMessage.success(`已设置任务阶段为：${stage.name}`)
  } catch (error) {
    console.error('设置任务阶段失败:', error)
    ElMessage.error('设置任务阶段失败')
  }
}

// 判断当前任务是否可以升级（当前任务有parent才能升级）
const canPromoteTask = computed(() => {
  if (!currentTask.value) return false
  return !!currentTask.value.parent && currentTask.value.parent !== 0
})

// 判断当前任务是否可以降级（同父级下前面有兄弟任务才能降级）
const canDemoteTask = computed(() => {
  if (!currentTask.value) return false
  const currentParent = currentTask.value.parent || 0
  // 获取同父级下的所有兄弟任务
  const siblingTasks = tasks.value.filter(t => (t.parent || 0) === currentParent)
  // 找到当前任务在兄弟任务中的索引
  const siblingIndex = siblingTasks.findIndex(t => t.id === currentTask.value.id)
  // 同父级下第一个任务不能降级
  return siblingIndex > 0
})

// 升级任务：将当前任务的parent设置为前一个任务的parent
const promoteTask = () => {
  if (!currentTask.value || !canPromoteTask.value) {
    ElMessage.warning('当前任务无法升级')
    return
  }

  try {
    const task = gantt.getTask(currentTask.value.id)

    if (task.parent == 0) {
      ElMessage.warning('当前任务已经是顶级任务，无法升级')
      return
    }

    // 获取父任务
    const parentTask = gantt.getTask(task.parent)

    // 设置新的parent为前一个任务的parent，如果前一个任务没有parent则设为0
    const newParent = parentTask ? (parentTask.parent || 0) : 0
    task.parent = newParent

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].parent = newParent
    }

    // 关闭右键菜单
    contextMenuVisible.value = false

    // 重新渲染甘特图
    setTimeout(() => {
      gantt.render()
    }, 100)

  } catch (error) {
    ElMessage.error('升级任务失败: ' + error.message)
  }
}

// 降级任务：将当前任务的parent设置为同父级下的前一个兄弟任务
const demoteTask = () => {
  if (!currentTask.value || !canDemoteTask.value) {
    ElMessage.warning('当前任务无法降级')
    return
  }

  try {
    const task = gantt.getTask(currentTask.value.id)
    const currentParent = task.parent || 0

    // 获取同父级下的所有兄弟任务
    const siblingTasks = tasks.value.filter(t => (t.parent || 0) === currentParent)

    // 找到当前任务在兄弟任务中的索引
    const siblingIndex = siblingTasks.findIndex(t => t.id === currentTask.value.id)

    // 获取同父级下的前一个兄弟任务
    const prevSiblingTask = siblingIndex > 0 ? siblingTasks[siblingIndex - 1] : null

    if (!prevSiblingTask) {
      ElMessage.warning('没有可作为父级的前置任务')
      return
    }

    // 设置新的parent为前一个兄弟任务的id
    task.parent = prevSiblingTask.id

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].parent = prevSiblingTask.id
    }

    // 关闭右键菜单
    contextMenuVisible.value = false

    // 重新渲染甘特图
    setTimeout(() => {
      gantt.render()
    }, 100)
  } catch (error) {
    ElMessage.error('降级任务失败: ' + error.message)
  }
}

// 设置任务类型
const setTaskType = (newType) => {
  if (!currentTask.value) {
    ElMessage.warning('请先选择一个任务')
    return
  }

  try {
    // 更新任务的类型属性
    const task = gantt.getTask(currentTask.value.id)
    task.type = newType

    // 更新甘特图中的任务
    gantt.updateTask(currentTask.value.id, task)

    // 更新本地任务数据
    const taskIndex = tasks.value.findIndex(t => t.id === currentTask.value.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].type = newType
    }

    // 关闭右键菜单
    contextMenuVisible.value = false

    // 重新渲染甘特图以更新任务显示
    setTimeout(() => {
      gantt.render()
    }, 100)
  } catch (error) {
    console.error('修改任务类型失败:', error)
    ElMessage.error('修改任务类型失败: ' + error.message)
  }
}

// 从右键菜单打开编辑对话框
const contextMenuOpenEditDialog = () => {
  contextMenuVisible.value = false
  openEditDialog(currentTask.value)
}

// 复制任务（包含子任务）
const copyTask = () => {
  contextMenuVisible.value = false

  if (!currentTask.value) {
    ElMessage.warning('请先选择要复制的任务')
    return
  }

  const sourceTask = currentTask.value
  const idMapping = new Map() // 用于映射旧ID到新ID

  // 递归获取所有子任务
  const getAllChildren = (parentId) => {
    const children = []
    tasks.value.forEach(task => {
      if (task.parent == parentId) {
        children.push(task)
        children.push(...getAllChildren(task.id))
      }
    })
    return children
  }

  // 获取要复制的所有任务（当前任务 + 子任务）
  const tasksToCopy = [sourceTask, ...getAllChildren(sourceTask.id)]

  // 为所有任务生成新ID（需要递增，避免重复）
  let nextId = getNextId()
  tasksToCopy.forEach(task => {
    idMapping.set(task.id, nextId++)
  })

  // 复制任务
  const copiedTasks = tasksToCopy.map(task => {
    const newId = idMapping.get(task.id)
    const newParent = task.id === sourceTask.id
      ? sourceTask.parent  // 根任务保持原父级
      : idMapping.get(task.parent) // 子任务使用映射后的父级ID

    return {
      ...task,
      id: newId,
      parent: newParent,
      text: task.id === sourceTask.id ? `${task.text}(副本)` : task.text,
      predecessors: [], // 复制的任务不保留前置任务关系
      start_date: task.start_date,
      end_date: task.end_date,
      planned_start: task.planned_start,
      planned_end: task.planned_end
    }
  })

  // 找到原任务在数组中的位置
  const sourceIndex = tasks.value.findIndex(t => t.id == sourceTask.id)

  // 计算原任务及其子任务占用的位置数
  const originalTaskCount = tasksToCopy.length

  // 在原任务后面插入复制的任务
  tasks.value.splice(sourceIndex + originalTaskCount, 0, ...copiedTasks)

  // 重新加载甘特图
  gantt.clearAll()
  loadData()

  // 定位到复制的任务
  setTimeout(() => {
    gantt.showTask(copiedTasks[0].id)
    const childCount = tasksToCopy.length - 1
    const message = childCount > 0
      ? `已复制任务"${sourceTask.text}"及其${childCount}个子任务`
      : `已复制任务"${sourceTask.text}"`
    ElMessage.success(message)
  }, 100)
}

// 确认删除任务
const confirmDeleteTask = () => {
  if (!currentTask.value) {
    ElMessage.warning('请先选择一个需要删除的任务')
    return
  }
  ElMessageBox.confirm(
    `确定要删除任务"${currentTask.value?.text}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const taskId = currentTask.value?.id
    gantt.deleteTask(taskId)
    showEditDialog.value = false
    contextMenuVisible.value = false
  }).catch(() => {
    contextMenuVisible.value = false
  })
}

// 展开全部
const expandAll = () => {
  gantt.eachTask((task) => {
    gantt.open(task.id)
  })
}

// 折叠全部
const collapseAll = () => {
  gantt.eachTask((task) => {
    gantt.close(task.id)
  })
}

// 导出Excel数据
const exportData = async () => {
  await exportGanttToExcel({
    tasks: tasks.value,
    projectInfo: projectInfo.value,
    sortedAllColumns: sortedAllColumns.value,
    visibleColumns: visibleColumns.value,
    model: viewMode.value
  })
}


// 导入数据
const importData = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileType = file.name.split('.').pop().toLowerCase()

  if (fileType === 'json') {
    handleJsonFile(file)
  } if (fileType === 'xlsx' || fileType === 'xls') {
    ElMessage.warning('Excel文件导入功能开发中，请使用JSON或CSV格式')
  } else {
    ElMessage.error('不支持的文件格式，请使用JSON、CSV或Excel文件')
  }

  // 清空文件选择
  event.target.value = ''
}

// 处理JSON文件
const handleJsonFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = importFromJson(e.target.result)
      if (importedData) {
        tasks.value = importedData.tasks
        links.value = importedData.links
        loadData()
        ElMessage.success(`JSON数据导入成功，导入了${importedData.tasks.length}个任务`)
      } else {
        ElMessage.error('JSON文件格式错误或数据无效')
      }
    } catch (error) {
      ElMessage.error('JSON文件解析失败: ' + error.message)
    }
  }
  reader.readAsText(file)
}


const getNextId = () => {
  return generateNewTaskId(tasks.value)
}

const addTaskToArray = (task) => {
  tasks.value.push({ ...task })
}

const removeTaskFromArray = (id) => {
  // 递归获取所有子任务ID（包括子任务的子任务）
  const getAllChildIds = (parentId) => {
    const childIds = []
    const directChildren = tasks.value.filter(t => t.parent == parentId)
    directChildren.forEach(child => {
      childIds.push(child.id)
      // 递归获取子任务的子任务
      childIds.push(...getAllChildIds(child.id))
    })
    return childIds
  }

  // 获取所有需要删除的任务ID（包括当前任务和所有子孙任务）
  const allIdsToDelete = [id, ...getAllChildIds(id)]

  // 删除所有任务
  allIdsToDelete.forEach(taskId => {
    const index = tasks.value.findIndex(t => t.id == taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  })

  // 删除links里面与这些任务相关的链接
  links.value = links.value.filter(l =>
    !allIdsToDelete.includes(l.source) && !allIdsToDelete.includes(l.target)
  )

  // 删除前置任务引用
  tasks.value.forEach(t => {
    if (t.predecessors && t.predecessors.length > 0) {
      t.predecessors = t.predecessors.filter(p => !allIdsToDelete.includes(p))
    }
  })
}

// 更新任务在数组中的顺序
const updateTaskOrderInArray = (draggedTaskId, targetInfo) => {
  try {
    const draggedTaskIndex = tasks.value.findIndex(t => t.id == draggedTaskId)
    if (draggedTaskIndex === -1) {
      return
    }

    // 移除被拖动的任务
    const [draggedTask] = tasks.value.splice(draggedTaskIndex, 1)

    // 从 gantt 获取更新后的任务信息（包含新的 parent）
    const updatedTask = gantt.getTask(draggedTaskId)
    if (updatedTask.parent !== undefined) {
      draggedTask.parent = updatedTask.parent
    }

    let targetIndex = 0
    let isNext = false

    // 解析target信息
    if (typeof targetInfo === 'string' && targetInfo.startsWith('next:')) {
      // target格式为 "next:targetId"，表示应该插入到目标任务之后
      const targetId = targetInfo.substring(5) // 移除 "next:" 前缀
      if (targetId == "null") {  //表示没动，放回原位？？
        tasks.value.splice(draggedTaskIndex, 0, draggedTask)
        tasks.value = [...tasks.value]
        return
      }
      const targetTaskIndex = tasks.value.findIndex(t => t.id == targetId)
      if (targetTaskIndex !== -1) {
        targetIndex = targetTaskIndex + 1
        isNext = true
      }
    } else {
      // target为任务ID，表示应该插入到目标任务之前
      const targetTaskIndex = tasks.value.findIndex(t => t.id == targetInfo)
      if (targetTaskIndex !== -1) {
        targetIndex = targetTaskIndex
      }
    }

    // 确保索引在有效范围内
    targetIndex = Math.max(0, Math.min(targetIndex, tasks.value.length))

    // 插入到新位置
    tasks.value.splice(targetIndex, 0, draggedTask)

    // 触发响应式更新
    tasks.value = [...tasks.value]
  } catch (error) {
    ElMessage.error('更新任务顺序失败')
  }
}

// 获取可选择的前置任务列表
const availableTasksForPredecessors = (currentTaskId) => {
  return tasks.value.filter(task => {
    // 排除当前任务本身
    if (task.id === currentTaskId) return false

    // 排除已经是当前任务子任务的任务（避免循环依赖）
    if (task.parent === currentTaskId) return false

    // 排除项目类型的任务作为前置任务（项目通常是容器）
    if (task.type === 'project') return false

    return true
  }).sort((a, b) => a.id - b.id)
}

// 根据前置任务创建链接
const createLinksFromPredecessors = (taskId, predecessors) => {
  if (!predecessors || predecessors.length === 0) return

  predecessors.forEach(predId => {
    const linkId = getNextLinkId()
    const link = {
      id: linkId,
      source: predId,
      target: taskId,
      type: "0"  // 完成-开始关系
    }

    // 添加到links数组
    links.value.push(link)

    // 添加到甘特图
    gantt.addLink(link)
  })
}

// 更新任务链接
const updateTaskLinks = (taskId, newPredecessors) => {
  // 删除旧的链接
  let linkToRemoves = links.value.filter(link => link.target === taskId)
  linkToRemoves.forEach(link => {
    console.log('删除链接:', link)
    gantt.deleteLink(link.id)
    const linkIndex = links.value.findIndex(l => l.id === link.id)
    if (linkIndex !== -1) {
      links.value.splice(linkIndex, 1)
    }
  })
  createLinksFromPredecessors(taskId, newPredecessors)
}

// 获取下一个链接ID
const getNextLinkId = () => {
  if (links.value.length === 0) return 1
  return Math.max(...links.value.map(link => link.id)) + 1
}

// 保存项目
const saveProject = async () => {
  saving.value = true
  try {
    // 确保projectInfo包含最新的配置
    if (!projectInfo.value) {
      projectInfo.value = {}
    }

    // 保存自定义列配置（只保存配置，不保存template函数）
    projectInfo.value.customColumns = customColumns.value.map(col => ({
      name: col.name,
      label: col.label,
      width: col.width,
      align: col.align,
      editor: col.editor,
      isCustom: col.isCustom
    }))

    // 保存可见字段配置
    projectInfo.value.visibleColumns = visibleColumns.value

    // 保存视图模式配置
    projectInfo.value.viewMode = viewMode.value

    // 保存权限配置
    projectInfo.value.visibilityScope = projectPermission.value.visibilityScope
    projectInfo.value.permissionUserIds = projectPermission.value.permissionUserIds
    projectInfo.value.permissionType = projectPermission.value.permissionType

    const result = await saveGanttDataToProject(tasks.value, links.value, projectInfo.value)

    // 更新项目信息
    if (result.data) {
      if (!projectInfo.value) {
        projectInfo.value = {}
      }
      // 兼容 result.data 为字符串（项目 code）或对象
      if (typeof result.data === 'string') {
        projectInfo.value.code = result.data
        if (!projectInfo.value.id) {
          projectInfo.value.id = result.data
        }
      } else if (result.data && typeof result.data === 'object') {
        Object.assign(projectInfo.value, result.data)
      }

      // 添加到项目列表中
      if (!projectList.value.find(project =>
        project.id === projectInfo.value.id || project.code === projectInfo.value.code
      )) {
        projectList.value.unshift({
          id: projectInfo.value.id,
          code: projectInfo.value.code,
          name: projectInfo.value.name,
          description: projectInfo.value.description
        })
      }

      // 如果是新建项目，更新URL
      if (!urlParams.value.code && result.data) {
        const newUrl = `${window.location.origin}${window.location.pathname}?code=${projectInfo.value.code}`
        window.history.replaceState({}, '', newUrl)
        urlParams.value.code = projectInfo.value.code
      }

      // 更新页面标题
      if (projectInfo.value.name) {
        document.title = `${projectInfo.value.name} - 星甘StarGantt | 免费在线甘特图工具 | 项目进度管理软件`
      }

      // 重新检查收藏状态
      checkStarStatus()
    }

      ElMessage.success('项目保存成功')
      return 200
  } catch (error) {
    if (error.status === 401 || error.code == '401') {
      ElMessage.error('请登录后保存')
      showLoginModal.value = true
    } else if (error.code == '50010') { //等级不够，直接显示个人中心
      ElMessage.error(error.message)
      userCenterVisible.value = true
    } else {
      // 默认错误处理
      const errorMessage = error.message || error.msg || '保存项目失败，请重试'
      ElMessage.error(errorMessage)
    }
    return error.code
  } finally {
    saving.value = false
  }
}

// 处理登录成功
const handleLoginSuccess = () => {
  loadUserInfo();
  showLoginModal.value = false
  // 如果用户是通过个人中心触发的登录，登录成功后自动打开个人中心
  if (pendingUserCenterOpen.value) {
    userCenterVisible.value = true
    pendingUserCenterOpen.value = false
  }
}

// 切换项目
const switchProject = async (projectCode) => {
  if (!projectCode) {
    return
  }

  try {
    loading.value = true

    gantt.clearAll()

    // 加载新项目数据
    await loadInitialData(projectCode)

    // 更新当前项目代码
    currentProjectCode.value = projectCode

    // 更新URL
    const newUrl = `${window.location.origin}${window.location.pathname}?code=${projectCode}`
    window.history.replaceState({}, '', newUrl)
    urlParams.value = { code: projectCode }

    // 重新渲染甘特图
    loadData()

    ElMessage.success(`已切换到项目: ${projectInfo.value?.name || '未命名项目'}`)
  } catch (error) {
    ElMessage.error('项目切换失败，请重试')
    // 恢复原来的选择
    currentProjectCode.value = urlParams.value?.code || ''
  } finally {
    loading.value = false
  }
}

// 更多菜单引用
const moreMenuRef = ref()

// 处理更多操作命令
const handleMoreCommand = (command) => {
  // 折叠所有展开的子菜单
  moreMenuRef.value?.close('baseline')

  switch (command) {
    case 'expand':
      expandAll()
      break
    case 'collapse':
      collapseAll()
      break
    case 'toggleDragSort':
      dragSortEnabled.value = !dragSortEnabled.value
      break
    case 'toggleTodayLine':
      toggleTodayLineEnabled.value = !toggleTodayLineEnabled.value
      break
    case 'toggleBaseline':
      baselineVisible.value = !baselineVisible.value
      break
    case 'export':
      exportData()
      break
    case 'setBaseline':
      setBaseline()
      break
    case 'delBaseline':
      delBaseline()
      break
  }
}

// 处理用户操作命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      // 检查是否已登录
      if (!userInfo.value || !getToken()) {
        ElMessage.warning('请先登录后查看个人中心')
        pendingUserCenterOpen.value = true  // 设置待打开标志
        showLoginModal.value = true
        return
      }
      userCenterVisible.value = true
      break
    case 'changePassword':
      // 检查是否已登录
      if (!userInfo.value || !getToken()) {
        ElMessage.warning('请先登录后修改密码')
        showLoginModal.value = true
        return
      }
      showChangePasswordDialog.value = true
      break
    case 'logout':
      userInfo.value = null
      removeToken()
      ElMessage.success('已退出登录')
      break
    case 'login':
      showLoginModal.value = true
      break
  }
}

// 提交修改密码
const submitChangePassword = async () => {
  if (!changePasswordFormRef.value) return

  try {
    await changePasswordFormRef.value.validate()

    changingPassword.value = true

    const response = await changePassword({
      password: encryptByMd5(changePasswordForm.value.newPassword)
    })

    if (response.code === 200) {
      ElMessage.success('密码修改成功')
      showChangePasswordDialog.value = false
      // 重置表单
      changePasswordForm.value = {
        newPassword: '',
        confirmPassword: ''
      }
      changePasswordFormRef.value.resetFields()
    } else {
      ElMessage.error(response.message || '修改密码失败')
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    changingPassword.value = false
  }
}


// 切换项目下拉菜单显示状态
const toggleProjectDropdown = () => {
  projectDropdownVisible.value = !projectDropdownVisible.value
}

// 处理项目下拉菜单显示状态变化
const handleDropdownVisibleChange = (visible) => {
  // 如果dropdown关闭，取消所有编辑状态
  if (!visible) {
    cancelEdit()
  }
}

// 处理项目命令
const handleProjectCommand = async (command) => {
  if (command === 'copy') {
    await copyProject()
  }
  else if (command === 'AIGenTask') {
    await AIGenTask()
  }
}

// DeepSeek生成任务
const AIGenTask = async () => {
  showAIGenDialog.value = true
}

// AI生成任务
const generateTasks = async () => {
  if (!aiGenForm.value.text || !aiGenForm.value.text.trim()) {
    ElMessage.warning('请输入项目内容')
    return
  }
  if (!aiGenForm.value.startDate) {
    ElMessage.warning('请选择开始日期')
    return
  }

  try {
    aiGenerating.value = true
    
    const response = await textToGantt({
      text: aiGenForm.value.text,
      startDate: aiGenForm.value.startDate
    })
    
    if (response && response.code == 200) {
      const result = response.data
      
      if (result.tasks && result.tasks.length > 0) {
        // 清除当前甘特图数据
        gantt.clearAll()
        
        // 覆盖当前的 tasks 和 links
        tasks.value = result.tasks
        links.value = result.links || []
        
        // 重新加载数据
        loadData()
        
        ElMessage.success(`AI生成成功，共生成 ${result.tasks.length} 个任务，${result.links?.length || 0} 条连接线`)
        showAIGenDialog.value = false
        
        // 重置表单
        aiGenForm.value.text = ''
      } else {
        ElMessage.warning('AI未能生成有效的任务数据，请重试或调整描述')
      }
    } else {
      ElMessage.error('AI生成失败，请重试')
    }
  } catch (error) {
    ElMessage.error('AI生成失败：' + (error.message || '未知错误'))
  } finally {
    aiGenerating.value = false
  }
}
//复制项目
const copyProject = async () => {
  if (!projectInfo.value || !projectInfo.value.code) {
    ElMessage.warning('当前项目不存在，无法复制')
    return
  }

  try {

    let copyres = await copy(projectInfo.value.id)
    if (copyres.code == 200) {
      const newUrl = `${window.location.origin}${window.location.pathname}?code=${copyres.data.code}`
      window.history.replaceState({}, '', newUrl)
      window.location.reload()
    } else {
      ElMessage.error(copyres.message)
    }
  } catch (error) {
    if (error.status === 401 || error.code == '401') {
      ElMessage.error('请登录后复制')
      showLoginModal.value = true
    } else if (error.code == '50010') { //等级不够，直接显示个人中心
      ElMessage.error(error.message)
      userCenterVisible.value = true
    } else {
      // 默认错误处理
      const errorMessage = error.message || error.msg || '复制项目失败，请重试'
      ElMessage.error(errorMessage)
    }
  }
}

const createNewProject = async () => {
  try {
    await ElMessageBox.confirm('创建新项目前，注意保存当前项目', '确认创建', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

    // 加载默认模板
    const defaultData = await loadGanttData()
    
    // 生成新项目 code
    const newCode = `GANTT_${Date.now()}`
    
    // 初始化项目信息
    projectInfo.value = {
      code: newCode,
      name: '未命名项目',
      description: '新建项目',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      visibilityScope: 3
    }

    // 初始化权限配置
    projectPermission.value = {
      visibilityScope: 3,
      permissionUserIds: [],
      permissionType: 'VIEW'
    }

    // 使用默认模板数据
    tasks.value = defaultData.tasks || []
    links.value = defaultData.links || []
    currentTask.value = null
    gantt.clearAll()
    
    // 重新加载甘特图
    loadData()

    // 自动保存新项目到 LocalStorage
    await saveProject()

    // 刷新项目列表
    await loadUserInfo()

    // 清空URL参数
    window.history.replaceState({}, '', window.location.pathname)
    urlParams.value = {}

    // 重置收藏状态
    isStarred.value = false

    ElMessage.success('新项目创建成功')
  } catch (e) {
    // 用户取消创建
  }
}

// 保存当前项目为默认模板
const saveAsTemplate = async () => {
  try {
    await ElMessageBox.confirm('确定将当前项目保存为默认模板吗？之后新建项目将使用此模板。', '保存模板', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 获取当前任务和数据
    const templateData = {
      tasks: tasks.value.map(task => ({
        ...task,
        start_date: task.start_date ? dayjs(task.start_date).format('YYYY-MM-DD') : '',
        end_date: task.end_date ? dayjs(task.end_date).format('YYYY-MM-DD') : '',
        planned_start: task.planned_start ? dayjs(task.planned_start).format('YYYY-MM-DD') : '',
        planned_end: task.planned_end ? dayjs(task.planned_end).format('YYYY-MM-DD') : ''
      })),
      links: links.value
    }
    
    // 保存到 localStorage
    localStorage.setItem('hardware-project-default-template', JSON.stringify(templateData))
    
    ElMessage.success('默认模板已保存！新建项目时将自动使用此模板')
  } catch (e) {
    // 用户取消保存
  }
}

// 导出模板JSON（从 localStorage 下载）
const exportTemplateJSON = () => {
  try {
    // 优先读取 localStorage 中的默认模板
    const templateStr = localStorage.getItem('hardware-project-default-template')
    if (!templateStr) {
      ElMessage.warning('localStorage 中没有默认模板，请先点击"保存为默认模板"')
      return
    }

    const templateData = JSON.parse(templateStr)
    const jsonStr = JSON.stringify(templateData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `项目模板-${dayjs().format('YYYY-MM-DD')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('模板 JSON 已导出，请发给我以固化到代码中')
  } catch (e) {
    console.error('导出模板 JSON 失败:', e)
    ElMessage.error('导出失败：' + e.message)
  }
}

// 开始编辑字段
const startEdit = (fieldName) => {
  // 重置所有编辑状态
  Object.keys(editingField.value).forEach(key => {
    editingField.value[key] = false
  })

  // 设置当前编辑字段
  editingField.value[fieldName] = true
  editingValue.value = projectInfo.value?.[fieldName] || ''
  originalValue.value = projectInfo.value?.[fieldName] || ''

  //下一个tick时聚焦输入框
  nextTick(() => {
    let inputRef
    if (fieldName === 'name') inputRef = nameInput.value
    else if (fieldName === 'code') inputRef = codeInput.value
    else if (fieldName === 'description') inputRef = descriptionInput.value

    if (inputRef) {
      inputRef.focus()
    }
  })
}

// 确认编辑
const confirmEdit = async (fieldName) => {
  if (!projectInfo.value) {
    projectInfo.value = {}
  }

  var oldCode = projectInfo.value[fieldName] //保存旧值

  // 更新项目信息
  projectInfo.value[fieldName] = editingValue.value

  // 重置编辑状态
  editingField.value[fieldName] = false
  editingValue.value = ''
  originalValue.value = ''

  // 自动保存项目
  var resp = await saveProject()
  if (resp != 200) {
    projectInfo.value[fieldName] = oldCode //回滚
    return
  }
  if (fieldName == 'code') { //如果code变了，需要跳转
    const newUrl = `${window.location.origin}${window.location.pathname}?code=${projectInfo.value.code}`
    window.history.replaceState({}, '', newUrl)
    window.location.reload()
    } else if (fieldName == 'name') { //如果name变了，需要更新页面标题
      document.title = `${projectInfo.value.name} - 星甘StarGantt | 免费在线甘特图工具 | 项目进度管理软件`
    loadUserInfo() //重新加载用户信息,用于刷新项目列表
  }
}

// 取消编辑
const cancelEdit = () => {
  Object.keys(editingField.value).forEach(key => {
    editingField.value[key] = false
  })
  editingValue.value = originalValue.value
  originalValue.value = ''
}

// 处理权限范围变化
const handleVisibilityScopeChange = async (value) => {
  // 当选择"仅我分享的好友"时,重置权限配置
  if (value === 1) {
    if (!projectPermission.value.permissionType) {
      projectPermission.value.permissionType = 'VIEW'
    }
  }

  // 自动保存项目
  await saveProject()
}


// 更新字段可见性
const updateColumnVisibility = () => {

  // 按照 visibleColumns 的顺序来排列列
  const filteredColumns = []
  const allColumnsList = getAllColumnsList.value

  // 遍历 visibleColumns，按顺序添加到 filteredColumns
  visibleColumns.value.forEach(columnName => {
    const column = allColumnsList.find(col => col.name === columnName)
    if (column) {
      filteredColumns.push({ ...column }) // 创建副本，避免修改原始定义
    }
  })

  gantt.config.columns = filteredColumns

  // 根据可见列数量动态调整Grid宽度
  adjustGridWidthByColumns(filteredColumns)

  // 重新渲染甘特图
  if (gantt && gantt.render) {
    gantt.render()
  }
}

// 初始化列拖拽排序
const initColumnDragSort = () => {
  nextTick(() => {
    // 初始化所有列的拖拽排序（基础列 + 自定义列）
    if (allColumnsContainer.value && allColumnsContainer.value.$el) {
      Sortable.create(allColumnsContainer.value.$el, {
        animation: 150,
        handle: '.drag-handle',
        draggable: '.draggable-column-item',
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          // 获取拖拽后的DOM顺序
          const items = Array.from(evt.to.children)
          const newOrder = items.map(item => {
            // 直接从元素上获取 data-column-name 属性
            const columnName = item.getAttribute('data-column-name')
            // 如果直接获取不到，尝试从子元素获取
            if (!columnName) {
              const checkbox = item.querySelector('[data-column-name]')
              return checkbox ? checkbox.getAttribute('data-column-name') : null
            }
            return columnName
          }).filter(name => name)

          // 更新 visibleColumns 的顺序
          updateColumnsOrder(newOrder)
        }
      })
    }
  })
}

// 更新列顺序（简化版，支持所有列拉通排序）
const updateColumnsOrder = (newOrder) => {
  // 创建新的 visibleColumns 数组
  const newVisibleColumns = []

  // 按新顺序添加所有可见的列
  newOrder.forEach(colName => {
    if (visibleColumns.value.includes(colName)) {
      newVisibleColumns.push(colName)
    }
  })

  // 添加那些在 visibleColumns 中但不在 newOrder 中的列（保持原顺序）
  visibleColumns.value.forEach(colName => {
    if (!newVisibleColumns.includes(colName)) {
      newVisibleColumns.push(colName)
    }
  })

  // 更新 visibleColumns
  visibleColumns.value = newVisibleColumns
}


// 全选所有列（包括自定义列）
const selectAllColumns = () => {
  visibleColumns.value = getAllColumnsList.value.map(column => column.name)
}

// 选择核心列（任务名称、开始时间、结束时间）
const selectHalfColumns = () => {
  visibleColumns.value = ['id', 'text', 'start_date', 'end_date', 'owner', 'description']
}

// 全不选
const unselectAllColumns = () => {
  visibleColumns.value = []
}

// 更新项目负责人列表
const updateProjectOwners = () => {
  const ownersSet = new Set()

  // 遍历所有任务，收集负责人信息
  tasks.value.forEach(task => {
    if (task.owner) {
      // 如果负责人是字符串且包含逗号，说明是多个负责人
      if (typeof task.owner === 'string' && task.owner.includes(',')) {
        const owners = task.owner.split(',').map(owner => owner.trim()).filter(owner => owner)
        owners.forEach(owner => ownersSet.add(owner))
      } else if (Array.isArray(task.owner)) {
        // 如果负责人是数组
        task.owner.forEach(owner => ownersSet.add(owner))
      } else {
        // 单个负责人
        ownersSet.add(task.owner)
      }
    }
  })

  // 更新projectOwners数组
  projectOwners.value = Array.from(ownersSet).sort()
}

//是否显示收藏按钮
const checkShowStarBtn = () => {
  if (userInfo.value == null) return true;
  if (projectInfo.value == null) return true;
  if (projectInfo.value.createUserId != userInfo.value.id) { //创建人不等于当前登录人
    if (projectInfo.value.permissionUserIds == null) return true; //没有指定人员
    if (projectInfo.value.permissionUserIds.length == 0) return true; //指定人员为空
    if (!projectInfo.value.permissionUserIds.includes(userInfo.value.id)) return true; //指定人员不包含当前登录人
  }
  return false; //创建人等于当前登录人或指定人员包含当前登录人
}

// 检查收藏状态
const checkStarStatus = () => {
  if (!projectInfo.value?.id || !projectList.value || !userInfo.value) {
    isStarred.value = false
    return
  }

  // 检查当前项目是否在用户的项目列表中（已收藏的项目）
  const starProject = projectList.value.find(project =>
    (project.id === projectInfo.value.id || project.code === projectInfo.value.code) && (project.createUserId != userInfo.value.id)
  )
  isStarred.value = !!starProject
}

// 切换收藏状态
const toggleStar = async () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录')
    showLoginModal.value = true
    return
  }

  if (!projectInfo.value?.id) {
    ElMessage.warning('这是个临时项目，不能Star')
    return
  }

  try {
    starring.value = true

    if (isStarred.value) {
      // 取消收藏
      await unstar(projectInfo.value.id)
      isStarred.value = false
      ElMessage.success('已取消收藏')

      // 从项目列表中移除
      const index = projectList.value.findIndex(project =>
        project.id === projectInfo.value.id || project.code === projectInfo.value.code
      )
      if (index !== -1) {
        projectList.value.splice(index, 1)
      }
    } else {
      // 添加收藏
      await star(projectInfo.value.id)
      isStarred.value = true
      ElMessage.success('收藏成功')

      // 添加到项目列表中
      if (!projectList.value.find(project =>
        project.id === projectInfo.value.id || project.code === projectInfo.value.code
      )) {
        projectList.value.unshift({
          id: projectInfo.value.id,
          code: projectInfo.value.code,
          name: projectInfo.value.name,
          description: projectInfo.value.description
        })
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    if (error.code === '401' || error.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      showLoginModal.value = true
    } else {
      ElMessage.error(isStarred.value ? '取消收藏失败' : '收藏失败')
    }
  } finally {
    starring.value = false
  }
}


// 打开历史记录对话框
const openHistoryDialog = () => {
  if (!projectInfo.value?.id) {
    ElMessage.warning('请先保存项目')
    return
  }
  //判断是否登录
  if (!userInfo.value) {
    ElMessage.warning('请先登录后查看历史记录')
    showLoginModal.value = true
    return
  }
  projectDropdownVisible.value = false
  showHistoryDialog.value = true
}

// 处理版本恢复
const handleHistoryRestore = (history) => {
  var data = JSON.parse(history.content)
  // projectInfo.value.code = history.code code不能随便回复
  projectInfo.value.name = history.name
  projectInfo.value.description = history.description

  tasks.value = data.tasks
  links.value = data.links

  gantt.parse({
    data: tasks.value,
    links: links.value
  })

  // 设置甘特图高度以支持滚动
  setTimeout(() => {
    gantt.setSizes()
    gantt.render()

    // 初始化完成后，根据可见列调整Grid宽度
    const initialVisibleCols = allColumns.filter(col => visibleColumns.value.includes(col.name))
    adjustGridWidthByColumns(initialVisibleCols)

    // 初始渲染自定义图层
    renderCustomTaskLayer()
  }, 100)

  // 确保projectInfo有customColumns字段
  if (!data.customColumns) {
    projectInfo.value.customColumns = []
  }

  // 恢复自定义列（需要重新创建template函数）
  if (data.customColumns.length > 0) {
    customColumns.value = data.customColumns.map(col => ({
      ...col,
      template: function (task) {
        return task[col.name] || '<span style="color: #c0c4cc;">-</span>'
      }
    }))
  } else {
    customColumns.value = []
  }

  // 恢复可见字段配置
  if (data.visibleColumns && data.visibleColumns.length > 0) {
    visibleColumns.value = data.visibleColumns
  } else {
    // 使用默认配置
    visibleColumns.value = [...defaultVisibleColumns]
  }

}

//删除
const deleteProject = async () => {
  if (projectInfo.value == null || (!projectInfo.value.code && !projectInfo.value.id)) {
    ElMessage.warning('这是个临时项目，不能删除')
    return
  }
  ElMessageBox.confirm('确定删除该项目吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const projectCode = projectInfo.value.code || projectInfo.value.id
    await del(projectCode)
    ElMessage.success('删除成功')
    const newUrl = `${window.location.origin}${window.location.pathname}`
    window.history.replaceState({}, '', newUrl)
    window.location.reload()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 基线渲染函数
const renderCustomTaskLayer = () => {
  // 遍历所有任务，渲染基线
  tasks.value.forEach(task => {
    if (!ganttContainer.value || !ganttContainer.value.querySelector) {
      return;
    }

    //获取的是gantt_bars_area gantt_task_line
    const taskLine = ganttContainer.value.querySelector(`.gantt_task_line[task_id="${task.id}"]`)
    if (!taskLine) return

    // 移除旧的基线（如果存在）
    const oldBaseline = taskLine.parentElement.querySelector(`.baseline[data-task-id="${task.id}"]`)
    if (oldBaseline) {
      oldBaseline.remove()
    }

    // 如果基线显示开关关闭，则不渲染
    if (!baselineVisible.value) {
      return
    }

    // 如果任务有计划时间，则渲染基线
    if (task.planned_start && task.planned_end) {
      try {
        const taskPosition = gantt.getTaskPosition(task, task.planned_start, task.planned_end)
        const el = document.createElement('div')
        el.className = 'baseline'
        el.style.position = 'absolute'
        el.style.top = taskPosition.top + 21 + 'px'
        el.style.left = taskPosition.left + 'px'
        el.style.width = taskPosition.width + 'px'
        el.setAttribute('data-task-id', task.id)

        if (task.type == 'milestone') {
          el.style.border = '1px solid #000'
          el.style.borderRadius = '50%'
          el.style.height = '10px'
          el.style.width = '10px'
        }
        taskLine.insertAdjacentElement('afterend', el)  //放在gantt_task_line后面同级
      } catch (e) {
        // 任务不在可见范围内或其他错误，跳过
      }
    }
  })
}

// 设置基线
const setBaseline = () => {

  ElMessageBox.confirm('确定设置当前进度为基线吗？', '确认设置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 遍历所有任务，将当前的开始和结束时间保存到计划时间字段
    tasks.value.forEach(task => {
      task.planned_start = task.start_date
      task.planned_end = task.end_date
    })

    baselineVisible.value = true

    setTimeout(renderCustomTaskLayer, 0);

    ElMessage.success('设置基线成功')
  })
}

// 删除基线
const delBaseline = () => {
  ElMessageBox.confirm('确定删除当前基线吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    tasks.value.forEach(task => {
      task.planned_start = null
      task.planned_end = null
    })
    setTimeout(renderCustomTaskLayer, 0);
    ElMessage.success('删除基线成功')
  })
}
</script>

<style scoped>
@import '../styles/index.css';
</style>
