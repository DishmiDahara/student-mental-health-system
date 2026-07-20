const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('Tunnel URL:', tunnel.url);
    fs.writeFileSync('tunnel-url.txt', tunnel.url);
    
    tunnel.on('close', () => {
      console.log('tunnel closed');
    });
  } catch (err) {
    console.error('Tunnel error:', err);
  }
})();
