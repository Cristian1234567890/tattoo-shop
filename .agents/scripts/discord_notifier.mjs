const WEBHOOKS = {
  notifications: "https://discord.com/api/webhooks/1557419211150729266/t-_C1etORi3vNFE9IfeZNT9tfe2j9DZNNUqW1RruXOzDUrjut_4bnHkh4jP_NksL0vQJ",
  quota: "https://discord.com/api/webhooks/1557422091957964881/ENW1_nUTJX7OjZEW-CKVfxC8k2FwCJJiSWHM27F_lYXaC_9h-xWg06HLNbDJZMVCPUv0",
  plan: "https://discord.com/api/webhooks/1557422834354229350/ODvKJJ9ovbW-F2V0gMk4fVZEIO1JiOt8HSLMKlJPnUwqpR4Vd6lLiOKV7Bua322gC8Ib",
  taskStatus: "https://discord.com/api/webhooks/1557423228216148029/XsTbBNdocKsrnFGoMP1IY8xkxtEqduJM_1uSuZ2e3_DDg1nbQP7IR0s0VNcdF9LzoqMD",
  alertas_agentes: "https://discord.com/api/webhooks/1557427496411078757/PZEAT8aJH8L6rAYsi-rkGZCIIh9-qcHuf1UXj_BAthmDZMewJtiPPFSx4GGF8kATxMgL",
  despliegue_desarrollo: "https://discord.com/api/webhooks/1557427605173444740/s7OhHPD7bZY5SKgWXh1ZOCDGgwfO3vkYrcKxMtFeydH1ssRvxqSQI7gRAOMnev9CKdHa",
  despliegue_productivo: "https://discord.com/api/webhooks/1557427848485015634/Y7BpjZQgyOQqNQiD5Nfw0Zf0BiY9NE-9ZjPketwZrDRvsgc2HqSDJADYGvlycQ1nCXEd",
  jira: "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf"
};

import fs from 'fs';

const channel = process.argv[2];
const input = process.argv[3];

if (!WEBHOOKS[channel]) {
  console.error(`Invalid channel: ${channel}`);
  process.exit(1);
}

let payload = {};
if (input.endsWith('.json') && fs.existsSync(input)) {
  try {
    payload = JSON.parse(fs.readFileSync(input, 'utf-8'));
    if (!payload.content && payload.embeds) {
      payload.content = "@everyone";
    }
  } catch (e) {
    console.error("Error parsing JSON file:", e);
    process.exit(1);
  }
} else {
  payload = { content: `@everyone\n${input}` };
}

fetch(WEBHOOKS[channel], {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(res => {
  if (res.ok) console.log(`Sent message to ${channel}`);
  else console.error(`Failed to send message: ${res.statusText}`);
}).catch(console.error);
