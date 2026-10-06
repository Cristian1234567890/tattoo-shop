const fs = require('fs');
const lines = fs.readFileSync('recovered.jsonl', 'utf8').trim().split('\n');
const obj = JSON.parse(lines[0]);
console.log(Object.keys(obj.tool_calls[0]));
