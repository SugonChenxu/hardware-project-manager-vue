/**
 * 支付 API（Mock 版）
 * 个人使用无需支付功能，全部返回 mock 数据
 */

// 创建支付订单
export const createPaymentOrder = async (params) => {
  return Promise.resolve({
    data: {
      orderId: 'order_' + Date.now(),
      payUrl: '',
      qrcode: '',
      amount: params.amount || 0,
      status: 'MOCK'
    }
  })
}

// 获取订单详情
export const getOrderDetail = async (orderId) => {
  return Promise.resolve({
    data: {
      orderId,
      status: 'PAID',
      amount: 0,
      payTime: new Date().toISOString()
    }
  })
}

// 查询用户 VIP 状态（供 UserCenter.vue 使用）
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
