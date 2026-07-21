const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Check if running inside Capacitor (native app environment)
  const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
  if (isCapacitor) {
    return 'http://10.0.2.2:5000';
  }
  // Same-domain API routing via Netlify /api/* rewrite proxy
  return '';
};

const API_URL = getApiUrl();
export default API_URL;
