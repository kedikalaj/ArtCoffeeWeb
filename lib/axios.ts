import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://192.168.170.205:5001", 
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default axiosInstance