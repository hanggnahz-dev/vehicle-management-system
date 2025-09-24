import axios from 'axios'
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
  (config) => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const userApi = {
  // 获取用户列表
  getUsers: () => api.get<User[]>('/users'),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get<User>('/users/me'),
  
  // 根据ID获取用户
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  
  // 创建用户
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<User>('/users', userData),
  
  // 更新用户
  updateUser: (id: number, userData: Partial<User>) => 
    api.put<User>(`/users/${id}`, userData),
  
  // 删除用户
  deleteUser: (id: number) => api.delete(`/users/${id}`),
}

export default api
