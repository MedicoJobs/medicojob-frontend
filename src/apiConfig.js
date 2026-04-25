const hostname = window.location.hostname;
const API_BASE_URL = process.env.REACT_APP_API_URL || `http://${hostname}:5000`;

export default API_BASE_URL;
