// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// API endpoints
export const API_ENDPOINTS = {
  CONNECTION_STATUS: `${API_BASE_URL}/api/connection_status`,
  CONNECT: `${API_BASE_URL}/api/connect`,
  DISCONNECT: `${API_BASE_URL}/api/disconnect`,
  GET_TABLES: `${API_BASE_URL}/api/get_tables`,
  PROCESS_TABLE: `${API_BASE_URL}/api/process_table`,
  QUERY: `${API_BASE_URL}/api/query`,
  PERFORMANCE_CONFIG: `${API_BASE_URL}/api/performance_config`
}

// Export the base URL for direct use if needed
export { API_BASE_URL }

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
} 