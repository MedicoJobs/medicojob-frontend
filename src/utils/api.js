const hostname = globalThis.location.hostname;
const defaultApiUrl = hostname === 'localhost' || hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : globalThis.location.origin;

const configuredApiUrl = process.env.REACT_APP_API_URL;

export const API_BASE_URL = configuredApiUrl && !configuredApiUrl.includes('your-backend-ec2-ip')
  ? configuredApiUrl
  : defaultApiUrl;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;
