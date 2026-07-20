const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if running inside Capacitor (native app environment)
  const isCapacitor = !!window.Capacitor;
  if (isCapacitor) {
    // 10.0.2.2 is the IP of the host machine from the Android Emulator.
    return 'http://10.0.2.2:5000';
  }
  // Use relative URL for web client (works for localhost, network IPs, and cloudflared/localtunnel tunnels via Vite Proxy)
  return '';
};

const API_URL = getApiUrl();
export default API_URL;
