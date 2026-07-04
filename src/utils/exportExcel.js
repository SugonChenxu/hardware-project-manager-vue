import ExcelJS from 'exceljs'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { getDayjsWeekOfMonth } from './index.js'

/**
 * 获取列字母（根据列索引）
 * @param {Number} columnIndex 列索引（从1开始）
 * @returns {String} 列字母（如：1->A, 2->B, 27->AA）
 */
const getColumnLetter = (columnIndex) => {
    let letter = ''
    let index = columnIndex
    while (index > 0) {
        const remainder = (index - 1) % 26
        letter = String.fromCharCode(65 + remainder) + letter
        index = Math.floor((index - 1) / 26)
    }
    return letter
}

/**
 * 导出甘特图为Excel文件
 * @param {Object} options 导出选项
 * @param {Array} options.tasks 任务列表
 * @param {Object} options.projectInfo 项目信息
 * @param {Array} options.sortedAllColumns 排序后的所有列
 * @param {Array} options.visibleColumns 可见列
 * @param {String} options.model 视图：default, month, quarter
 */
export const exportGanttToExcel = async (options) => {
    const { tasks, projectInfo, sortedAllColumns, visibleColumns, model } = options

    try {
        // 创建工作簿
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('甘特图')

        // 状态映射
        const statusMap = {
            'completed': '已完成',
            'in_progress': '进行中',
            'not_started': '未开始',
            'on_hold': '已暂停',
            'cancelled': '已取消'
        }

        // 获取所有任务的日期范围
        let minDate = null
        let maxDate = null
        tasks.forEach(task => {
            if (task.start_date) {
                const startDate = dayjs(task.start_date)
                if (!minDate || startDate.isBefore(minDate)) {
                    minDate = startDate
                }
            }
            if (task.end_date) {
                const endDate = dayjs(task.end_date)
                if (!maxDate || endDate.isAfter(maxDate)) {
                    maxDate = endDate
                }
            }
        })

        // 如果没有任务日期，使用默认范围
        if (!minDate) minDate = dayjs()
        if (!maxDate) maxDate = dayjs().add(30, 'day')

        // 根据视图模式生成日期列表和配置
        let dateColumns = []
        let columnWidth = 3

        if (model === 'month') {
            // 月视图：按周生成
            const weekColumns = []
            let currentDate = minDate.startOf('week')
            const endDate = maxDate.endOf('week')

            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                weekColumns.push(currentDate)
                currentDate = currentDate.add(1, 'week')
            }

            dateColumns = weekColumns
            columnWidth = 5 // 月视图列宽
        } else if (model === 'quarter') {
            // 季度视图：按月生成
            const monthColumns = []
            let currentDate = minDate.startOf('month')
            const endDate = maxDate.endOf('month')

            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
                monthColumns.push(currentDate)
                currentDate = currentDate.add(1, 'month')
            }

            dateColumns = monthColumns
            columnWidth = 8 // 季度视图列宽
        } else {
            // 默认视图：按天生成
            let currentDate = minDate
            while (currentDate.isBefore(maxDate) || currentDate.isSame(maxDate, 'day')) {
                dateColumns.push(currentDate)
                currentDate = currentDate.add(1, 'day')
            }
            columnWidth = 3 // 默认视图列宽
        }

        // 根据 sortedAllColumns 和 visibleColumns 生成列结构
        const leftColumns = sortedAllColumns
            .filter(col => visibleColumns.includes(col.name))
            .map(col => ({
                header: col.label,
                key: col.name,
                width: col.name === 'text' ? 30 : col.name === 'description' ? 20 :
                    col.name === 'predecessors' ? 15 :
                        col.name === 'start_date' || col.name === 'end_date' ? 12 :
                            col.name === 'progress' ? 8 :
                                col.name === 'id' || col.name === 'duration' ? 6 : 10
            }))

        // 找到 start_date 和 end_date 列的索引
        const startDateColIndex = leftColumns.findIndex(col => col.key === 'start_date')
        const endDateColIndex = leftColumns.findIndex(col => col.key === 'end_date')
        const idColIndex = leftColumns.findIndex(col => col.key === 'id')

        // 添加左侧列和日期列
        const columns = [...leftColumns]
        dateColumns.forEach((date, index) => {
            columns.push({
                header: model === 'month' ? `第${date.week()}周` :
                    model === 'quarter' ? date.format('M月') :
                        date.format('M-D'),
                key: `date_${index}`,
                width: columnWidth
            })
        })
        worksheet.columns = columns

        // 设置第一行和第二行（根据不同视图模式）
        if (model === 'month') {
            // 月视图：第一行显示月份，第二行显示周
            let currentMonth = null
            let monthStartCol = leftColumns.length + 1

            dateColumns.forEach((date, index) => {
                const col = leftColumns.length + 1 + index
                const month = date.format('YYYY-M')

                if (month !== currentMonth) {
                    if (currentMonth !== null) {
                        // 合并前一个月的单元格
                        worksheet.mergeCells(1, monthStartCol, 1, col - 1)
                        const cell = worksheet.getCell(1, monthStartCol)
                        cell.value = dayjs(currentMonth, 'YYYY-M').format('YYYY年M月')
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.font = { bold: true, size: 10 }
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF5B9BD5' }
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                    }
                    currentMonth = month
                    monthStartCol = col
                }
            })

            // 处理最后一个月
            if (currentMonth !== null) {
                const lastCol = leftColumns.length + dateColumns.length
                worksheet.mergeCells(1, monthStartCol, 1, lastCol)
                const cell = worksheet.getCell(1, monthStartCol)
                cell.value = dayjs(currentMonth, 'YYYY-M').format('YYYY年M月')
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { bold: true, size: 10 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF5B9BD5' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            }

            // 设置第二行（周）
            const secondRow = worksheet.getRow(2)
            dateColumns.forEach((date, index) => {
                const cell = secondRow.getCell(leftColumns.length + 1 + index)
                cell.value = `第${getDayjsWeekOfMonth(date)}周`
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { size: 9 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7F3F8' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            })
        } else if (model === 'quarter') {
            // 季度视图：第一行显示季度，第二行显示月份
            let currentQuarter = null
            let quarterStartCol = leftColumns.length + 1

            dateColumns.forEach((date, index) => {
                const col = leftColumns.length + 1 + index
                const year = date.year()
                const quarter = Math.floor((date.month()) / 3) + 1
                const quarterKey = `${year}-Q${quarter}`

                if (quarterKey !== currentQuarter) {
                    if (currentQuarter !== null) {
                        // 合并前一个季度的单元格
                        worksheet.mergeCells(1, quarterStartCol, 1, col - 1)
                        const cell = worksheet.getCell(1, quarterStartCol)
                        const [qYear, qNum] = currentQuarter.split('-Q')
                        cell.value = `${qYear}年第${qNum}季度`
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.font = { bold: true, size: 10 }
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF5B9BD5' }
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                    }
                    currentQuarter = quarterKey
                    quarterStartCol = col
                }
            })

            // 处理最后一个季度
            if (currentQuarter !== null) {
                const lastCol = leftColumns.length + dateColumns.length
                worksheet.mergeCells(1, quarterStartCol, 1, lastCol)
                const cell = worksheet.getCell(1, quarterStartCol)
                const [qYear, qNum] = currentQuarter.split('-Q')
                cell.value = `${qYear}年第${qNum}季度`
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { bold: true, size: 10 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF5B9BD5' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            }

            // 设置第二行（月份）
            const secondRow = worksheet.getRow(2)
            dateColumns.forEach((date, index) => {
                const cell = secondRow.getCell(leftColumns.length + 1 + index)
                cell.value = `${date.format('M')}月`
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { size: 9 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7F3F8' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            })
        } else {
            // 默认视图：第一行显示月份，第二行显示日期
            let currentMonth = null
            let monthStartCol = leftColumns.length + 1

            dateColumns.forEach((date, index) => {
                const col = leftColumns.length + 1 + index
                const month = date.format('YYYY-M')

                if (month !== currentMonth) {
                    if (currentMonth !== null) {
                        // 合并前一个月的单元格
                        worksheet.mergeCells(1, monthStartCol, 1, col - 1)
                        const cell = worksheet.getCell(1, monthStartCol)
                        cell.value = dayjs(currentMonth, 'YYYY-M').format('YYYY年M月')
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.font = { bold: true, size: 10 }
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF5B9BD5' }
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                    }
                    currentMonth = month
                    monthStartCol = col
                }
            })

            // 处理最后一个月
            if (currentMonth !== null) {
                const lastCol = leftColumns.length + dateColumns.length
                worksheet.mergeCells(1, monthStartCol, 1, lastCol)
                const cell = worksheet.getCell(1, monthStartCol)
                cell.value = dayjs(currentMonth, 'YYYY-M').format('YYYY年M月')
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { bold: true, size: 10 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF5B9BD5' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            }

            // 设置第二行（日期）
            const secondRow = worksheet.getRow(2)
            dateColumns.forEach((date, index) => {
                const cell = secondRow.getCell(leftColumns.length + 1 + index)
                cell.value = date.date()
                cell.alignment = { horizontal: 'center', vertical: 'middle' }
                cell.font = { size: 9 }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7F3F8' }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            })
        }

        // 设置左侧表头（合并1-2行）
        leftColumns.forEach((col, index) => {
            worksheet.mergeCells(1, index + 1, 2, index + 1)
            const cell = worksheet.getCell(1, index + 1)
            cell.value = col.header
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
            cell.font = { bold: true, size: 10 }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF5B9BD5' }
            }
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            }
        })

        // 按 $index 排序任务
        const sortedTasks = tasks.slice().sort((a, b) => {
            const indexA = a.$index !== undefined ? a.$index : Infinity
            const indexB = b.$index !== undefined ? b.$index : Infinity
            return indexA - indexB
        })

        // 标准化所有任务的 predecessors 字段（确保是数组格式）
        sortedTasks.forEach(task => {
            if (typeof task.predecessors === 'string') {
                // 如果是字符串，按逗号分割并转成数字数组
                task.predecessors = task.predecessors
                    .split(',')
                    .map(id => parseInt(id.trim()))
                    .filter(id => !isNaN(id))
            } else if (!Array.isArray(task.predecessors)) {
                // 如果不是数组，设置为空数组
                task.predecessors = []
            }
        })

        // 创建任务ID到Excel行号的映射（任务从第3行开始）
        const taskRowMapping = {}
        sortedTasks.forEach((task, taskIndex) => {
            taskRowMapping[task.id] = taskIndex + 3
        })

        // 添加任务数据
        sortedTasks.forEach((task, taskIndex) => {
            const rowIndex = taskIndex + 3
            const row = worksheet.getRow(rowIndex)

            // 判断是否为奇数行（用于相间颜色）
            const isOddRow = (taskIndex % 2) === 0

            // 左侧数据 - 根据列配置动态填充
            leftColumns.forEach((col, colIndex) => {
                const cell = row.getCell(colIndex + 1)
                const fieldName = col.key

                // 根据字段类型处理值
                if (fieldName === 'id') {
                    cell.value = taskIndex + 1
                } else if (fieldName === 'text') {
                    // 根据层级添加缩进
                    const level = task.$level || 0
                    const indent = '  '.repeat(level)
                    cell.value = indent + (task.text || '')
                } else if (fieldName === 'start_date') {
                    // 解析前置任务（可能是数组或逗号分隔的字符串）
                    let predecessorIds = task.predecessors || []
                    if (typeof predecessorIds === 'string') {
                        predecessorIds = predecessorIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                    }

                    // 如果任务有前置任务，使用公式计算机开始日期
                    if (predecessorIds.length > 0) {
                        // 获取所有前置任务的行号
                        const predecessorRows = predecessorIds
                            .map(predId => taskRowMapping[predId])
                            .filter(row => row !== undefined)

                        if (predecessorRows.length > 0) {
                            // 构建公式：取所有前置任务结束日期的最大值 + 1天
                            const endDateColLetter = getColumnLetter(endDateColIndex + 1)
                            const maxFormula = predecessorRows
                                .map(row => `${endDateColLetter}${row}`)
                                .join(',')
                            // 使用公式：=MAX(C5,C10)+1  (假设C列是结束日期)
                            cell.value = { formula: `MAX(${maxFormula})+1` }
                            cell.numFmt = 'yyyy-mm-dd'
                        } else {
                            cell.value = dayjs(task.start_date).format('YYYY-MM-DD') || ''
                        }
                    } else {
                        cell.value = dayjs(task.start_date).format('YYYY-MM-DD') || ''
                    }
                } else if (fieldName === 'end_date') {
                    cell.value = dayjs(task.end_date).format('YYYY-MM-DD') || ''
                    // 设置日期格式
                    cell.numFmt = 'yyyy-mm-dd'
                } else if (fieldName === 'duration') {
                    cell.value = task.duration || 0
                } else if (fieldName === 'progress') {
                    cell.value = `${Math.round((task.progress || 0) * 100)}%`
                } else if (fieldName === 'owner') {
                    cell.value = task.owner || ''
                } else if (fieldName === 'status') {
                    cell.value = statusMap[task.status] || '未开始'
                } else if (fieldName === 'description') {
                    cell.value = task.description || ''
                } else if (fieldName === 'stakeholder') {
                    cell.value = task.stakeholder || ''
                } else if (fieldName === 'predecessors') {
                    // 处理前置任务（可能是数组或字符串）
                    let predValue = task.predecessors || ''
                    if (Array.isArray(predValue)) {
                        cell.value = predValue.join(', ')
                    } else if (typeof predValue === 'string') {
                        cell.value = predValue
                    } else {
                        cell.value = ''
                    }
                } else {
                    // 自定义列
                    cell.value = task[fieldName] || ''
                }
            })

            // 设置左侧单元格样式（相间颜色）
            for (let i = 1; i <= leftColumns.length; i++) {
                const cell = row.getCell(i)
                // 判断是否是 text 列（项目名称）
                const isTextColumn = leftColumns[i - 1]?.key === 'text'
                cell.alignment = { horizontal: isTextColumn ? 'left' : 'center', vertical: 'middle' }
                cell.font = { size: 9 }

                // 相间颜色：奇数行浅白色，偶数行浅灰色
                const fillColor = isOddRow ? 'FFFEFEFE' : 'FFF5F5F5'

                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor }
                }
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                    left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                    bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                    right: { style: 'thin', color: { argb: 'FFDCDCDC' } }
                }
            }

            // 绘制甘特图条形图
            if (task.start_date && task.end_date) {
                const taskStart = dayjs(task.start_date)
                const taskEnd = dayjs(task.end_date)
                // 计算任务总天数
                const totalDays = taskEnd.diff(taskStart, 'day') + 1

                dateColumns.forEach((date, dateIndex) => {
                    const cell = row.getCell(leftColumns.length + 1 + dateIndex)

                    let isInRange = false
                    let currentPeriodStart = date
                    let currentPeriodEnd = date

                    if (model === 'month') {
                        // 月视图：判断任务是否在当前周内
                        const weekStart = date.startOf('week')
                        const weekEnd = date.endOf('week')
                        currentPeriodStart = weekStart
                        currentPeriodEnd = weekEnd

                        isInRange = (taskStart.isBefore(weekEnd) || taskStart.isSame(weekEnd, 'day')) &&
                            (taskEnd.isAfter(weekStart) || taskEnd.isSame(weekStart, 'day'))
                    } else if (model === 'quarter') {
                        // 季度视图：判断任务是否在当前月内
                        const monthStart = date.startOf('month')
                        const monthEnd = date.endOf('month')
                        currentPeriodStart = monthStart
                        currentPeriodEnd = monthEnd

                        isInRange = (taskStart.isBefore(monthEnd) || taskStart.isSame(monthEnd, 'day')) &&
                            (taskEnd.isAfter(monthStart) || taskEnd.isSame(monthStart, 'day'))
                    } else {
                        // 默认视图：判断当前日期是否在任务范围内
                        isInRange = (date.isAfter(taskStart) || date.isSame(taskStart, 'day')) &&
                            (date.isBefore(taskEnd) || date.isSame(taskEnd, 'day'))
                    }

                    // 判断当前日期是否在任务范围内
                    if (isInRange) {

                        // 根据进度显示不同颜色
                        let fillColor = 'FFE7E6E6' // 默认浅灰色（未开始）

                        if (task.status === 'completed') {
                            fillColor = 'FFA5D6A7' // 绿色（已完成）
                        } else if (task.status === 'in_progress') {
                            // 进行中的任务，如果有进度需要计算颜色
                            if (task.progress && task.progress > 0) {
                                // 计算当前日期单元格的结束位置在任务时间范围内的比例
                                const cellEnd = model === 'month' || model === 'quarter' ? currentPeriodEnd : date
                                const daysFromStart = cellEnd.diff(taskStart, 'day') + 1
                                const progressPosition = daysFromStart / totalDays

                                // 如果当前单元格的位置在已完成的进度范围内，使用深红色，否则使用浅红色
                                if (progressPosition <= task.progress) {
                                    fillColor = 'FFA5D6A7' // 绿色（已完成部分）
                                } else {
                                    fillColor = 'FFEF9A9A' // 浅红色（未完成部分）
                                }
                            } else {
                                fillColor = 'FFEF9A9A' // 红色（进行中，无进度）
                            }
                        } else if (task.type === 'milestone') {
                            fillColor = 'FFFFEB3B' // 黄色（里程碑）
                        }

                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: fillColor }
                        }
                    } else {
                        // 如果不在任务范围内，也设置相间颜色
                        const altFillColor = isOddRow ? 'FFFEFEFE' : 'FFF5F5F5'
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: altFillColor }
                        }
                    }

                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        right: { style: 'thin', color: { argb: 'FFDCDCDC' } }
                    }
                })
            } else {
                // 如果没有日期，也要设置边框和相间颜色
                dateColumns.forEach((date, dateIndex) => {
                    const cell = row.getCell(leftColumns.length + 1 + dateIndex)
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        right: { style: 'thin', color: { argb: 'FFDCDCDC' } }
                    }
                    // 添加相间颜色
                    const altFillColor = isOddRow ? 'FFFEFEFE' : 'FFF5F5F5'
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: altFillColor }
                    }
                })
            }
        })

        // 冻结窗格（冻结左侧列和前2行）
        worksheet.views = [
            { state: 'frozen', xSplit: leftColumns.length, ySplit: 2 }
        ]

        // 生成文件名
        const fileName = `${projectInfo?.name || '甘特图'}-${dayjs().format('YYYY-MM-DD')}.xlsx`

        // 导出文件
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(url)

        ElMessage.success(`Excel文件导出成功：${fileName}`)
    } catch (error) {
        ElMessage.error('Excel导出失败，请重试')
    }
}

