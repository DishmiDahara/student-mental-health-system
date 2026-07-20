import localtunnel from 'localtunnel';
import fs from 'fs';

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('Tunnel URL:', tunnel.url);
    fs.writeFileSync('tunnel-url.txt', tunnel.url);
  } catch (err) {
    console.error('Tunnel error:', err);
  }
})();
