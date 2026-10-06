const fs = require('fs');
function extractCode(file, target) {
    if (!fs.existsSync(file)) return;
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    for (const line of lines) {
        if (!line) continue;
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                for (const call of obj.tool_calls) {
                    if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
                        const args = call.args;
                        if (args.TargetFile.endsWith(target)) {
                            fs.writeFileSync(args.TargetFile, args.CodeContent);
                            console.log('Restored: ' + target);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing line:', e.message);
        }
    }
}
extractCode('recovered_all.jsonl', 'HomePage.tsx');
