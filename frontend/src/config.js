const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if running inside Capacitor (native app environment)
  const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
  if (isCapacitor) {
    return 'http://10.0.2.2:5000';
  }
  // If running on Netlify or external phone/web domain, route to active Cloudflare backend tunnel
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://domestic-solved-declined-nutritional.trycloudflare.com';
  }
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();
export default API_URL;
