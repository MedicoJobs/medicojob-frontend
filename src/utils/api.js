const hostname = globalThis.location.hostname;
const defaultApiUrl = hostname === 'localhost' || hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : `http://${hostname}:5000`;

export const API_BASE_URL = process.env.REACT_APP_API_URL || defaultApiUrl;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;
