/*
 * @Descripttion:
 * @version:
 * @Date: 2022-05-12 22:06:21
 * @LastEditTime: 2025-11-25 21:46:56
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 */

/**
 * 按字段给数组分组
 * @param {*} list
 * @param {*} groupBy
 * @returns
 */
export function groupBy(list, groupBy) {
  result = list.reduce(function (result, item) {
    let groupVal = item[groupBy]
    result[groupVal] = result[groupVal] || []
    result[groupVal].push(item)
    return result
  }, Object.create(null))

  var result = Object.entries(result) //转成keyvalue

  let finalresult = []
  result.forEach(element => {
    let orgin = Object.assign(
      {},
      list.find(u => u[groupBy] == element[0])
    )
    orgin['details'] = element[1].slice() //明细列表
    finalresult.push(orgin)
  })

  return finalresult
}

/**
 * 获取类型默认值
 * @param {string} type 类型名称
 * @returns
 */
export function defaultVal(type) {
  if (typeof type !== 'string') throw new TypeError('Type must be a string.')

  // Handle simple types (primitives and plain function/object)
  switch (type) {
    case 'decimal':
      return 0
    case 'bool':
      return false
    case 'int':
      return 0
    case 'null':
      return null
    case 'number':
      return 0
    case 'object':
      return {}
    case 'string':
      return ''
    case 'DateTime':
      return parseTime(new Date())
    case 'symbol':
      return Symbol()
    case 'undefined':
      return void 0
  }

  try {
    // Look for constructor in this or current scope
    var ctor = typeof this[type] === 'function' ? this[type] : eval(type)

    return new ctor()

    // Constructor not found, return new object
  } catch (e) {
    return {}
  }
}

/**
 * 去重
 * @param {Array} arr 含有重复元素的数组
 * @returns
 */
export function unique(arr) {
  var obj = {}
  return arr.filter(function (item) {
    return Object.prototype.hasOwnProperty.call(obj, typeof item + item)
      ? false
      : (obj[typeof item + item] = true)
  })
}

/**
 * 按id去重
 * @param {Array} arr 含有重复Id的数组
 * @returns
 */
export function uniquebyId(arr) {
  const seenIds = new Map()

  const filteredArr = arr.filter(item => {
    if (seenIds.has(item.id)) {
      return false // 如果 id 已经存在于 Map 中，则过滤掉该对象
    } else {
      seenIds.set(item.id, true) // 否则，将 id 添加到 Map 中
      return true // 保留该对象
    }
  })
  return filteredArr
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}


// 计算本月第几周的函数
export function getWeekOfMonth(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstWeekday = firstDayOfMonth.getDay() // 0是周日，1是周一...
  const dayOfMonth = date.getDate()

  // 计算本月第几周（从1开始）
  const weekOfMonth = Math.ceil((dayOfMonth + firstWeekday) / 7)
  return weekOfMonth
}

//使用dayjs内置函数计算指定日期在该月的第几周
export function getDayjsWeekOfMonth(date) {
  const firstDay = date.startOf('month')
  const offset = firstDay.day() === 0 ? 6 : firstDay.day() - 1 // 将周一设为一周第一天
  return Math.ceil((date.date() + offset) / 7)
}

export function formatTime(format) {
  const now = new Date()
  var o = {
    'M+': now.getMonth() + 1, // month
    'd+': now.getDate(), // day
    'h+': now.getHours(), // hour
    'm+': now.getMinutes(), // minute
    's+': now.getSeconds(), // second
    'q+': Math.floor((now.getMonth() + 3) / 3), // quarter
    S: now.getMilliseconds() // millisecond
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (now.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}
