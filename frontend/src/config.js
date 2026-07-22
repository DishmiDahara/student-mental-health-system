const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if running inside Capacitor (native app environment)
  const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
  if (isCapacitor) {
    return 'http://10.0.2.2:5000';
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    if (/^(192\.168|10|172\.(1[6-9]|2[0-9]|3[0-1]))\./.test(hostname)) {
      return `http://${hostname}:5000`;
    }
    // For cloudflare tunnels or external domains, return relative path to use dev proxy
    return '';
  }
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const API_BASE_URL = API_URL;
export default API_URL;
