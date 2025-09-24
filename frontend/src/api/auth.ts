import axios from 'axios'
import type { LoginRequest, LoginResponse } from '@/stores/auth'
import type { User } from '@/stores/user'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  // 用户登录
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),

  // 获取当前用户信息
  getCurrentUser: () => api.get<User>('/auth/me'),

  // 用户登出
  logout: () => api.post('/auth/logout'),

  // 刷新token
  refreshToken: () => api.post<{ token: string }>('/auth/refresh'),
}

export default api
