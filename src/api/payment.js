/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2025-09-15 17:03:24
 * @Description: 
 * @LastEditTime: 2025-09-15 21:11:37
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
import request from '@/utils/request'

// 创建支付订单
export function createPaymentOrder(data) {
  return request({
    url: '/WeChatPay/CreateOrder',
    method: 'post',
    data,
  })
}


// 获取订单详情
export function getOrderDetail(orderId) {
  return request({
    url: `/WeChatPay/GetOrder?outTradeNo=${orderId}`,
    method: 'get',
  })
}
