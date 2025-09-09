/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2025-09-09 16:20:38
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 */

import CryptoJS from 'crypto-js'

// Base64加密
export function encryptByBase64(cipherText) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(cipherText))
}

// Base64解密
export function decryptByBase64(cipherText) {
  return CryptoJS.enc.Base64.parse(cipherText).toString(CryptoJS.enc.Utf8)
}

// MD5加密，不可逆
export function encryptByMd5(password) {
  return CryptoJS.MD5(password).toString()
}
