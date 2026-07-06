const fs = require('fs');
const key = 'sk-pro...n';
const secret = '***';
const url = '***';
fs.writeFileSync('C:/Users/adien/aitutor/.env.local', `OPENAI_API_KEY=${key}\nNEXTAUTH_SECRET=${secret}\nNEXTAUTH_URL=${url}\n`);
console.log('Written', fs.statSync('C:/Users/adien/aitutor/.env.local').size, 'bytes');
