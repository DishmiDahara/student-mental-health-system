import { spawn } from 'child_process';
import fs from 'fs';

const cf = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'], {
  shell: true
});

cf.stdout.on('data', (data) => {
  const text = data.toString();
  console.log(text);
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match) {
    fs.writeFileSync('cf-url.txt', match[0]);
    console.log('CLOUDFLARE URL:', match[0]);
  }
});

cf.stderr.on('data', (data) => {
  const text = data.toString();
  console.log(text);
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match) {
    fs.writeFileSync('cf-url.txt', match[0]);
    console.log('CLOUDFLARE URL:', match[0]);
  }
});
