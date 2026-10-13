// Centralized API configuration supporting dynamic environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  HEALTH: `${API_BASE_URL}/health`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  COMPLAINTS: `${API_BASE_URL}/api/complaints`,
  NOTICES: `${API_BASE_URL}/api/notices`,
  GATEPASSES: `${API_BASE_URL}/api/gatepasses`,
  STUDENTS: `${API_BASE_URL}/api/students`,
  WARDENS: `${API_BASE_URL}/api/wardens`,
};

export default API_ENDPOINTS;
