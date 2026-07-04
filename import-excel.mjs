import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// 读取Excel文件
const workbook = XLSX.readFile('C:/Users/chenxu/Downloads/模版-2026-07-04.xlsx');
const sheet = workbook.Sheets['甘特图'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});

// 解析日期（处理Excel日期序列号）
const parseDate = (value) => {
  if (!value) return '';
  
  // 如果已经是字符串格式 YYYY-MM-DD
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return value;
  }
  
  // 如果是Date对象
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 如果是Excel日期序列号（数字）
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return '';
};

// 解析任务数据（从第3行开始，索引2）
const tasks = [];
const parentStack = []; // 存储每层的父任务ID [level-1, level-2, ...]

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[0] || row[0] === '') continue;
  
  const id = parseInt(row[0]);
  const textRaw = row[1] || '';
  const text = textRaw.trim();
  const startDate = parseDate(row[2]);
  const endDate = parseDate(row[3]);
  const duration = parseInt(row[4]) || 1;
  const statusText = row[5] || '未开始';
  const progressText = row[6] || '0%';
  const owner = row[7] || '';
  const stakeholder = row[8] || '';
  
  // 正确处理前置任务（可能是富文本对象或字符串）
  let predecessorsText = '';
  if (row[9]) {
    if (typeof row[9] === 'string') {
      predecessorsText = row[9];
    } else if (row[9].v !== undefined) {
      predecessorsText = row[9].v.toString();
    } else if (row[9].w !== undefined) {
      predecessorsText = row[9].w.toString();
    }
  }
  
  const description = row[10] || '';
  
  // 根据缩进判断层级
  const indent = textRaw.match(/^(\s*)/)[1].length;
  const level = Math.floor(indent / 2); // 假设每个缩进是2个空格
  
  // 判断任务类型
  let type = 'task';
  let parent = 0;
  
  if (level === 0) {
    // 顶层任务，是项目阶段
    type = 'project';
    parent = 0;
    parentStack[0] = id;
  } else {
    // 子任务
    type = 'task';
    parent = parentStack[level - 1] || 0;
    parentStack[level] = id;
  }
  
  // 解析前置任务
  let predecessors = [];
  if (predecessorsText) {
    predecessors = predecessorsText
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
  }
  
  // 解析状态
  const statusMap = {
    '未开始': 'not_started',
    '进行中': 'in_progress',
    '已完成': 'completed',
    '已暂停': 'on_hold',
    '已取消': 'cancelled'
  };
  
  // 解析进度
  const progress = parseFloat(progressText.replace('%', '')) / 100 || 0;
  
  tasks.push({
    id: id,
    text: text,
    start_date: startDate,
    end_date: endDate,
    duration: duration,
    progress: progress,
    type: type,
    parent: parent,
    status: statusMap[statusText] || 'not_started',
    owner: owner,
    stakeholder: stakeholder,
    predecessors: predecessors,
    description: description,
    planned_start: startDate,
    planned_end: endDate
  });
}

// 生成links
const links = [];
tasks.forEach(task => {
  if (task.predecessors && task.predecessors.length > 0) {
    task.predecessors.forEach(predId => {
      links.push({
        id: links.length + 1,
        source: predId,
        target: task.id,
        type: '0' // 完成-开始
      });
    });
  }
});

// 构建输出
const output = {
  tasks: tasks,
  links: links
};

// 保存到文件
writeFileSync('src/data/gantt-data.json', JSON.stringify(output, null, 2));
console.log('✅ 导入完成！');
console.log(`   任务数量: ${tasks.length}`);
console.log(`   依赖关系: ${links.length}`);
console.log(`   输出文件: src/data/gantt-data.json`);

// 打印前几个任务验证
console.log('\n前5个任务:');
tasks.slice(0, 5).forEach(t => {
  console.log(`  ID=${t.id}, 名称=${t.text}, 类型=${t.type}, 父任务=${t.parent}, 开始=${t.start_date}, 结束=${t.end_date}`);
});
