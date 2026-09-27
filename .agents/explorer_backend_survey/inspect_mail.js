const fs = require('fs');
const content = fs.readFileSync('backend/backend/mail-template.js', 'utf8');

const regex = /\$\{([^}]+)\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Match:', match[0], 'around index:', match.index);
  const start = Math.max(0, match.index - 50);
  const end = Math.min(content.length, match.index + 50);
  console.log('Snippet:', content.substring(start, end).replace(/\s+/g, ' '));
}
