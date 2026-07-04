const XLSX = require('xlsx');

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
  
  // 判断任务类型
  let type = 'task';
  let parent = 0;
  
  // 根据缩进判断层级
  const indent = (text.match(/^\s+/) || [''])[0].length;
  const cleanText = text.trim();
  
  if (cleanText.includes('阶段') || cleanText.includes('Phase') || indent === 0) {
    // 可能是项目或阶段
    if (i === 2) {
      type = 'project';
    } else {
      type = 'project';
      parent = 0;
    }
    currentParent = id;
  } else {
    type = 'task';
    parent = currentParent || 0;
  }
  
  tasks.push({
    id: id,
    text: cleanText,
    start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
    end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
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

console.log(JSON.stringify(output, null, 2));
