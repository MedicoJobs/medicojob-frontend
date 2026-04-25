const hostname = window.location.hostname;
export const API_BASE_URL = process.env.REACT_APP_API_URL || `http://${hostname}:5000`;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || `http://${hostname}:5000`;
