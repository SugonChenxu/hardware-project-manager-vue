<div align="center">
  <h1>⭐ StarGantt 星甘</h1>
  <p>开源免费的在线甘特图制作平台</p>
  
  [![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
  [![Vue 3](https://img.shields.io/badge/Vue-3.4.0-brightgreen.svg)](https://vuejs.org/)
  [![Element Plus](https://img.shields.io/badge/Element%20Plus-2.4.4-409EFF.svg)](https://element-plus.org/)

  [在线演示](http://g.openauth.net.cn) · [报告问题](https://gitee.com/yubaolee/StarGantt/issues) · [功能建议](https://gitee.com/yubaolee/StarGantt/issues)
</div>

---

## 📖 简介

StarGantt（星甘）是一款基于 Vue3 + Element Plus 开发的专业项目进度管理工具，致力于打造开源免费的在线甘特图制作平台。无论你是项目经理、产品经理，还是需要管理个人项目的自由职业者，StarGantt 都能为你提供专业、直观的项目可视化管理体验。


## ✨ 核心特性

### 🎯 专业的甘特图功能

- **多视图模式** - 支持日视图、周视图、月视图、季度视图，满足不同项目周期需求
- **任务依赖管理** - 支持前置任务设置，自动生成和可视化依赖关系线
- **拖拽操作** - 支持任务拖拽调整时间、重新排序，操作简单直观

### 📊 强大的任务管理

- **丰富的任务属性** - 任务名称、开始时间、工期、完成进度、负责人、相关方
- **状态管理** - 未开始、进行中、已完成、已暂停、已取消等多种状态
- **任务分组** - 支持父任务和子任务的层级结构
- **自定义字段** - 灵活的字段显示/隐藏配置
- **任务搜索** - 快速定位和筛选任务

### 💼 现代化的用户界面

- **类 Outlook 设计** - 借鉴 Microsoft Outlook 的设计语言，专业且易用
- **响应式布局** - 自适应不同屏幕尺寸
- **暗色模式** - 支持明暗主题切换（计划中）
- **多语言支持** - 中英文界面切换（计划中）

### 🔧 实用辅助功能

- **数据导出** - 支持导出 Excel 格式，方便汇报和备份
- **多项目管理** - 支持创建和管理多个项目，快速切换
- **项目收藏** - 收藏重要项目，方便快速访问
- **权限管理** - 支持用户登录和权限控制

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装

```bash
# 克隆项目
git clone https://gitee.com/yubaolee/StarGantt.git

# 进入项目目录
cd StarGantt

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 构建生产环境
npm run build


## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **UI 组件库**: [Element Plus](https://element-plus.org/) - 基于 Vue 3 的组件库
- **甘特图引擎**: [DHTMLX Gantt](https://dhtmlx.com/docs/products/dhtmlxGantt/) - 专业的甘特图库
- **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐的状态管理库
- **路由管理**: [Vue Router](https://router.vuejs.org/) - Vue 官方路由解决方案
- **HTTP 客户端**: [Axios](https://axios-http.com/) - 基于 Promise 的 HTTP 库
- **日期处理**: [Day.js](https://day.js.org/) - 轻量级日期处理库
- **Excel 导出**: [SheetJS](https://sheetjs.com/) - 强大的 Excel 处理库
- **构建工具**: [Vite](https://vitejs.dev/) - 下一代前端构建工具

## 📦 项目结构

```
StarGantt/
├── public/                 # 静态资源
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── api/               # API 接口定义
│   ├── components/        # 公共组件
│   │   ├── GanttChart.vue    # 甘特图核心组件
│   │   ├── LoginModal.vue    # 登录模态框
│   │   └── ...
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── services/          # 业务服务层
│   ├── utils/             # 工具函数
│   ├── styles/            # 全局样式
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
├── package.json           # 项目依赖
└── README.md              # 项目文档
```

## 📝 使用场景

StarGantt 适用于多种项目管理场景：

1. **软件开发项目** - 需求分析 → 设计 → 开发 → 测试 → 上线的完整流程管理
2. **产品规划** - 产品路线图、功能迭代计划、发布时间规划
3. **活动策划** - 从前期准备到活动执行的全流程规划
4. **工程项目** - 建筑、装修等需要严格时间控制的项目
5. **学习计划** - 考研、考证等长期学习目标的时间规划
6. **个人事务** - 旅行规划、婚礼筹备等个人项目管理

## 🤝 贡献指南

我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能

### 贡献流程

1. Fork 本仓库
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [GPL v2.0](./LICENSE) 协议开源。

## 🔗 相关链接

- [在线演示](http://g.openauth.net.cn)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 官方文档](https://element-plus.org/)

## 💬 联系我们

如有任何问题或建议，欢迎通过以下方式联系我们：

- 提交 [Issue](https://gitee.com/yubaolee/StarGantt/issues)
- 访问我们的 [官网](http://g.openauth.net.cn)

---

<div align="center">
  Made with ❤️ by StarGantt Team
</div>
