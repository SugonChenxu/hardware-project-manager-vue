import ExcelJS from 'exceljs'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

/**
 * 导出甘特图为Excel文件
 * @param {Object} options 导出选项
 * @param {Array} options.tasks 任务列表
 * @param {Object} options.projectInfo 项目信息
 * @param {Array} options.sortedAllColumns 排序后的所有列
 * @param {Array} options.visibleColumns 可见列
 */
export const exportGanttToExcel = async (options) => {
    const { tasks, projectInfo, sortedAllColumns, visibleColumns } = options

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

        // 生成日期列表（按天）
        const dateColumns = []
        let currentDate = minDate
        while (currentDate.isBefore(maxDate) || currentDate.isSame(maxDate, 'day')) {
            dateColumns.push(currentDate)
            currentDate = currentDate.add(1, 'day')
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

        // 添加左侧列和日期列
        const columns = [...leftColumns]
        dateColumns.forEach((date, index) => {
            columns.push({
                header: date.format('M-D'),
                key: `date_${index}`,
                width: 3
            })
        })
        worksheet.columns = columns

        // 设置第一行（年月）
        const firstRow = worksheet.getRow(1)
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

        // 添加任务数据
        tasks.forEach((task, taskIndex) => {
            const rowIndex = taskIndex + 3
            const row = worksheet.getRow(rowIndex)

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
                    cell.value = task.start_date || ''
                } else if (fieldName === 'end_date') {
                    cell.value = task.end_date || ''
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
                    cell.value = task.predecessors?.join(', ') || ''
                } else {
                    // 自定义列
                    cell.value = task[fieldName] || ''
                }
            })

            // 设置左侧单元格样式
            for (let i = 1; i <= leftColumns.length; i++) {
                const cell = row.getCell(i)
                // 判断是否是 text 列（项目名称）
                const isTextColumn = leftColumns[i - 1]?.key === 'text'
                cell.alignment = { horizontal: isTextColumn ? 'left' : 'center', vertical: 'middle' }
                cell.font = { size: 9 }
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

                dateColumns.forEach((date, dateIndex) => {
                    const cell = row.getCell(leftColumns.length + 1 + dateIndex)

                    // 判断当前日期是否在任务范围内
                    if ((date.isAfter(taskStart) || date.isSame(taskStart, 'day')) &&
                        (date.isBefore(taskEnd) || date.isSame(taskEnd, 'day'))) {

                        // 根据进度显示不同颜色
                        let fillColor = 'FFE7E6E6' // 默认浅灰色（未开始）

                        if (task.status === 'completed') {
                            fillColor = 'FFA5D6A7' // 绿色（已完成）
                        } else if (task.status === 'in_progress') {
                            fillColor = 'FFEF9A9A' // 红色（进行中）
                        } else if (task.type === 'milestone') {
                            fillColor = 'FFFFEB3B' // 黄色（里程碑）
                        }

                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: fillColor }
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
                // 如果没有日期，也要设置边框
                dateColumns.forEach((date, dateIndex) => {
                    const cell = row.getCell(leftColumns.length + 1 + dateIndex)
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
                        right: { style: 'thin', color: { argb: 'FFDCDCDC' } }
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

