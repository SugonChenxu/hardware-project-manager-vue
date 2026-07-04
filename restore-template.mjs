import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// 读取Excel文件
const workbook = XLSX.readFile('C:/Users/chenxu/Downloads/模版-2026-07-04.xlsx');
const sheet = workbook.Sheets['甘特图'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''});

// 找到表头行
const headerRow = data[0];
console.log('表头:', headerRow);

// 解析任务数据
const tasks = [];
let currentParent = null;
let parentStack = []; // 用于跟踪父任务层级

for (let i = 2; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[0]) continue;
  
  const id = parseInt(row[0]);
  const text = row[1] || '';
  const startDate = row[2] || '';
  const endDate = row[3] || '';
  const duration = parseInt(row[4]) || 1;
  const status = row[6] || 'not_started';
  const progress = parseFloat(row[7]) || 0;
  const owner = row[8] || '';
  const stakeholder = row[9] || '';
  const predecessors = row[10] ? row[10].toString().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
  const description = row[11] || '';
  
  // 判断任务类型和层级
  let type = 'task';
  let parent = 0;
  
  // 根据缩进判断层级
  const indent = (text.match(/^\s+/) || [''])[0].length;
  const cleanText = text.trim();
  
  // 判断是否是阶段（包含特定关键词）
  if (cleanText.includes('阶段') || cleanText.includes('Phase')) {
    type = 'project';
    parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : 0;
    parentStack.push(id);
  } else if (indent === 0 && i === 2) {
    // 第一个任务，可能是根项目
    type = 'project';
    parent = 0;
    parentStack.push(id);
  } else {
    type = 'task';
    parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : 0;
  }
  
  tasks.push({
    id: id,
    text: cleanText,
    start_date: startDate ? (startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate) : '',
    end_date: endDate ? (endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate) : '',
    duration: duration,
    progress: progress / 100, // 转换为0-1
    type: type,
    parent: parent,
    status: status === '未开始' ? 'not_started' : 
            status === '进行中' ? 'in_progress' :
            status === '已完成' ? 'completed' : 'not_started',
    owner: owner,
    stakeholder: stakeholder,
    predecessors: predecessors,
    description: description
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

// 输出JSON
const output = {
  tasks: tasks,
  links: links
};

writeFileSync('restore-output.json', JSON.stringify(output, null, 2));
console.log('转换完成！输出文件: restore-output.json');
console.log(`共转换 ${tasks.length} 个任务，${links.length} 个依赖关系`);
