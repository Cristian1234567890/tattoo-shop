import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config/jira.json'), 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

async function checkMeta() {
  const res = await fetch(`${config.host}/rest/api/3/project/${config.projectKey}`, {
    headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
  });
  if (res.ok) {
    const data = await res.json();
    console.log('Project:', data.name, `(${data.key})`);
    console.log('Issue Types:');
    data.issueTypes.forEach(t => {
      console.log(` - ${t.name} (id: ${t.id}, subtask: ${t.subtask})`);
    });
  } else {
    console.error('Error fetching project meta:', res.status, await res.text());
  }
}

checkMeta().catch(console.error);
