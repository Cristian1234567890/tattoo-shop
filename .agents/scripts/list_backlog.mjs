import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

async function getBacklog() {
  const jql = encodeURIComponent('project = TH ORDER BY key ASC');
  const res = await fetch(`${config.host}/rest/api/3/search/jql?jql=${jql}&fields=key,summary,status,priority,issuetype&maxResults=100`, {
    headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
  });
  if (res.ok) {
    const data = await res.json();
    console.log(`Total tickets pendientes: ${data.issues?.length || 0}`);
    data.issues?.forEach(issue => {
      console.log(`\n========================================`);
      console.log(`[${issue.key}] (${issue.fields.status.name}) [${issue.fields.priority?.name || 'Normal'}]`);
      console.log(`Summary: ${issue.fields.summary}`);
      if (typeof issue.fields.description === 'string') {
        console.log(`Description: ${issue.fields.description.slice(0, 300)}...`);
      } else if (issue.fields.description) {
        console.log(`Description: [ADF Object: ${JSON.stringify(issue.fields.description).slice(0, 300)}...]`);
      }
    });
  } else {
    console.error('Error fetching Jira issues:', res.status, await res.text());
  }
}

getBacklog().catch(console.error);
