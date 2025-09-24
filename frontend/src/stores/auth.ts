import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/stores/user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    localStorage.getItem('user') &&
      localStorage.getItem('user') !== 'undefined' &&
      localStorage.getItem('user') !== 'null'
      ? JSON.parse(localStorage.getItem('user') as string)
      : null
  )
  const loading = ref(false)

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 计算属性：是否为管理员
  const isAdmin = computed(() => {
    return user.value?.roles?.includes('admin') || false
  })
  // 登录
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      const response = await authApi.login({ email, password })
      const { token: newToken, user: userData } = (response.data as any).data

      // 保存token
      token.value = newToken
      localStorage.setItem('token', newToken)

      // 获取完整的用户信息（包括角色）
      const fullUserData = await getCurrentUser()

      return { token: newToken, user: fullUserData }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      if (!token.value) {
        throw new Error('未登录')
      }

      const response = await authApi.getCurrentUser()
      user.value = (response.data as any).data
      localStorage.setItem('user', JSON.stringify((response.data as any).data))

      return (response.data as any).data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除本地存储
      logout()
      throw error
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // 验证token是否仍然有效
        await getCurrentUser()
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        logout()
      }
    }
  }

  // 检查token是否过期
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    getCurrentUser,
    initAuth,
    isTokenExpired,
  }
})
