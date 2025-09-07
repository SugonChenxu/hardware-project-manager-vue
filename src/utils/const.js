/*
 * @Author: yubaolee <yubaolee@163.com> | ahfu~ <954478625@qq.com>
 * @Date: 2022-05-13 01:31:17
 * @LastEditTime: 2025-05-15 23:15:46
 * @Description: 
 * Copyright (c) 2025 by yubaolee | ahfu~ , All Rights Reserved.  
 */
export const statusOptions = [
  {
    key: -1,
    display_name: '草稿',
  },
  {
    key: 0,
    display_name: '正在运行',
  },
  {
    key: 1,
    display_name: '完成',
  },
  {
    key: 2,
    display_name: '未知',
  },
  {
    key: 3,
    display_name: '没有通过',
  },
  {
    key: 4,
    display_name: '驳回',
  },
]

/**
 * 代码生成器中定义的编辑类型
 */
export const typeLists = [
  {
    label: '文本框',
    value: 'text',
  },
  {
    label: '多行文本框',
    value: 'textarea',
  },
  {
    label: '开关', //用于修改bool类型的switch
    value: 'switch',
  },
  {
    label: '下拉列表', //静态数据
    value: 'select',
  },
  {
    label: '动态下拉列表', //动态选择，数据时从接口中获取
    value: 'selectDynamic',
  },
  {
    label: '日期',
    value: 'date',
  },
  {
    label: '日期时间',
    value: 'datetime',
  },
  {
    label: '文件',
    value: 'file',
  },
  {
    label: '复选框',
    value: 'checkbox',
  }
]

/**
 * 表单类型
 */
export const FORM_TYPE = {
  DYNAMIC: 0,  // 动态表单
  DEVELOP: 1,  // 自定义表单
  DRAG: 2,     // vForm拖拽表单
  URL: 3       // URL表单
}

// 操作符定义
export const compareOperators = [
  { label: '等于 =', value: '=' },
  { label: '不等于 !=', value: '!=' },
  { label: '大于 >', value: '>' },
  { label: '大于等于 >=', value: '>=' },
  { label: '小于 <', value: '<' },
  { label: '小于等于 <=', value: '<=' }
]

export const textOperators = [
  { label: '包含', value: 'LIKE' },
  { label: '不包含', value: 'NOT LIKE' },
  { label: '开头是', value: 'START_WITH' },
  { label: '结尾是', value: 'END_WITH' }
]

export const rangeOperators = [
  { label: '在集合中', value: 'IN' },
  { label: '不在集合中', value: 'NOT IN' },
  { label: '在范围内', value: 'BETWEEN' }
]

export const nullOperators = [
  { label: '为空', value: 'IS NULL' },
  { label: '不为空', value: 'IS NOT NULL' }
]
