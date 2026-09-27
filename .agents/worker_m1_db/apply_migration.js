const https = require('https');
const fs = require('fs');
const path = require('path');

const token = 'sbp_oauth_f0c48bf0b5aadce78504df93f6642965ac01642c';
const projectId = 'mftthukphffirdcoqprz';
const migrationPath = path.resolve(__dirname, '../../v2/backend/migrations/01_init.sql');

function post(payload, sessionId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': Buffer.byteLength(data)
    };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;

    const req = https.request('https://mcp.supabase.com/mcp', { method: 'POST', headers }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Reading migration file:', migrationPath);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Initializing MCP session...');
  const initRes = await post({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'migration-runner', version: '1.0.0' }
    }
  });

  const sessionId = initRes.headers['mcp-session-id'];
  console.log('Session ID acquired:', sessionId);

  await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId);

  console.log('Executing apply_migration tool...');
  const callRes = await post({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'apply_migration',
      arguments: {
        project_id: projectId,
        name: '01_init',
        query: sql
      }
    }
  }, sessionId);

  console.log('apply_migration response status:', callRes.status);
  console.log('apply_migration response body:', callRes.body);

  const resultJson = JSON.parse(callRes.body);
  if (resultJson.error) {
    throw new Error('Migration failed: ' + JSON.stringify(resultJson.error));
  }

  console.log('Migration successfully applied!');
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
