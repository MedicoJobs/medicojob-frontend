const hostname = globalThis?.location?.hostname || 'localhost';
const API_BASE_URL = `http://${hostname}:5000`;

export default API_BASE_URL;