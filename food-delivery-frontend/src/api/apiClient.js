
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received from the server
      console.error('No response received:', error.request);
    } else {
      // Something else went wrong
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
// },
// });

// // Add a request interceptor to include the auth token
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default apiClient;