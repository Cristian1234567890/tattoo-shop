import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

async function getDetails() {
  for (const key of ['TH-7', 'TH-8', 'TH-9', 'TH-10', 'TH-11']) {
    const res = await fetch(`${config.host}/rest/api/3/issue/${key}`, {
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`\n========================================`);
      console.log(`TICKET: ${key}`);
      console.log(`Summary: ${data.fields.summary}`);
      console.log(`Status: ${data.fields.status.name}`);
      console.log(`Description:`, JSON.stringify(data.fields.description, null, 2));
      console.log(`Comments: ${data.fields.comment?.comments?.length || 0}`);
      data.fields.comment?.comments?.forEach(c => {
        console.log(` - Comment: ${JSON.stringify(c.body)}`);
      });
    }
  }
}

getDetails().catch(console.error);
