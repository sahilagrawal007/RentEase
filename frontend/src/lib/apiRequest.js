import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
apiRequest.interceptors.request.use(
  (config) => {
    // You can add any request preprocessing here
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      switch (status) {
        case 400:
          console.error("Bad request:", message);
          break;
        case 401:
          console.error("Unauthorized:", message);
          break;
        case 403:
          console.error("Forbidden:", message);
          break;
        case 404:
          console.error("Not found:", message);
          break;
        case 500:
          console.error("Server error:", message);
          break;
        default:
          console.error(`Error ${status}:`, message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiRequest;