// frontend/src/api/axiosInstance.js
import axios from 'axios'

const inst = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // withCredentials: true // uncomment only if you use cookie auth
})

inst.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
}, err => Promise.reject(err))

export default inst
