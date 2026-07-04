/**
 * 登录 API（Mock 版）
 * 直接返回模拟用户，跳过登录
 */

// 获取用户资料（Mock）
export const getUserProfile = async () => {
  return {
    data: {
      id: 1,
      username: 'chenxu',
      displayName: '陈旭',
      email: 'chenxu@example.com',
      avatar: '',
      role: 'ADMIN'
    }
  }
}

// 登录（Mock）
export const login = async (params) => {
  return { data: { token: 'mock-token', user: await getUserProfile().then(r => r.data) } }
}

// 获取验证码图片（Mock）
export const getCodeImg = async () => {
  return Promise.resolve({
    data: {
      code: 'mock-captcha',
      img: ''
    }
  })
}

// 登出（Mock）
export const logout = async () => {
  return { data: { success: true } }
}

// 注册（Mock）
export const register = async (params) => {
  return { data: { success: true, userId: 1 } }
}
