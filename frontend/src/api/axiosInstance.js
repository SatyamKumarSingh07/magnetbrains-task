// frontend/src/api/axiosInstance.js
import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const inst = axios.create({ baseURL: base })

inst.interceptors.request.use(cfg => {
  const tokenStr = localStorage.getItem('auth')
  if (tokenStr) {
    try {
      const auth = JSON.parse(tokenStr)
      if (auth?.token) cfg.headers.Authorization = `Bearer ${auth.token}`
    } catch {}
  }
  return cfg
}, e => Promise.reject(e))

export default inst
