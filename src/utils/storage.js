/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2022-05-12 22:06:21
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 */
export const getItem = name => {
  const data = window.localStorage.getItem(name)
  try {
    return JSON.parse(data)
  } catch (err) {
    return data
  }
}

export const setItem = (name, value) => {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }

  window.localStorage.setItem(name, value)
}

export const removeItem = name => {
  window.localStorage.removeItem(name)
}
