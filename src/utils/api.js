const hostname = globalThis.location.hostname;
export const API_BASE_URL = (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('your-backend-ec2-ip')) ? process.env.REACT_APP_API_URL : `http://${hostname}:5000`;
export const SOCKET_URL = `http://${hostname}:5000`;
