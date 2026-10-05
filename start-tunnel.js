const { spawn } = require('child_process');
const fs = require('fs');

console.log('Starting Cloudflare Tunnel for mobile access...');
const tunnel = spawn('npx', ['cloudflared', 'tunnel', '--url', 'http://localhost:5173'], { shell: true });

tunnel.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(str);
  const match = str.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (match) {
    console.log('Tunnel URL:', match[0]);
    fs.writeFileSync('tunnel-url.txt', match[0]);
  }
});

tunnel.stderr.on('data', (data) => {
  const str = data.toString();
  console.log(str);
  const match = str.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (match) {
    console.log('Tunnel URL:', match[0]);
    fs.writeFileSync('tunnel-url.txt', match[0]);
  }
});
