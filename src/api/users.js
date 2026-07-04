/**
 * 用户 API（Mock 版）
 * 个人使用，无需多用户管理，全部返回 mock 数据
 */

export const changePassword = async (params) => {
  return Promise.resolve({ data: { success: true, message: '密码已修改（Mock）' } })
}

export const getList = async (params) => {
  return Promise.resolve({
    data: [
      { id: 1, username: 'chenxu', displayName: '陈旭', role: 'ADMIN' }
    ]
  })
}

export const loadByIds = async (params) => {
  return Promise.resolve({
    data: [
      { id: 1, username: 'chenxu', displayName: '陈旭', role: 'ADMIN' }
    ]
  })
}

export const add = async (params) => {
  return Promise.resolve({ data: { success: true, userId: Date.now() } })
}

// 获取用户 VIP 信息（Mock）
export const getUserVip = async () => {
  return Promise.resolve({
    data: {
      isVip: false,
      vipType: '',
      vipExpireTime: '',
      features: []
    }
  })
}
