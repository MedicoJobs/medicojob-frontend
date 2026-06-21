const hostname = globalThis.location.hostname;
<<<<<<< HEAD
const defaultApiUrl = hostname === 'localhost' || hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : `http://${hostname}:5000`;

const configuredApiUrl = process.env.REACT_APP_API_URL;

export const API_BASE_URL = configuredApiUrl && !configuredApiUrl.includes('your-backend-ec2-ip')
  ? configuredApiUrl
  : defaultApiUrl;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;
=======
export const API_BASE_URL = (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('your-backend-ec2-ip')) ? process.env.REACT_APP_API_URL : `http://${hostname}:5000`;
export const SOCKET_URL = `http://${hostname}:5000`;
>>>>>>> origin/main
