/**
 * 服务器配置 API（Mock 版）
 * 个人使用无需检查更新，直接返回当前版本
 */

export const getWebVersion = async () => {
  return Promise.resolve({
    data: {
      version: '1.0.0',
      features: ['甘特图', '任务管理', '项目历史'],
      updateUrl: ''
    }
  })
}

export const isIdentityAuth = async () => {
  return Promise.resolve({ data: { identityAuth: false } })
}
