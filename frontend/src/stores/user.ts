import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'

export interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  roles?: string[]
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

  const fetchUsers = async () => {
    try {
      loading.value = true
      const response = await userApi.getUsers()
      users.value = (response.data as any).data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchUserInfo = async () => {
    try {
      const response = await userApi.getCurrentUser()
      currentUser.value = (response.data as any).data
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
    }
  }

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      const response = await userApi.createUser(userData)
      const newUser = (response.data as any).data
      users.value.push(newUser)
      return newUser
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      loading.value = true
      const response = await userApi.updateUser(id, userData)
      const updatedUser = (response.data as any).data
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      loading.value = true
      await userApi.deleteUser(id)
      users.value = users.value.filter(user => user.id !== id)
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    loading,
    fetchUsers,
    fetchUserInfo,
    createUser,
    updateUser,
    deleteUser,
  }
})
