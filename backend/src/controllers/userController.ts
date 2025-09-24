import { Request, Response } from 'express'
import { UserModel } from '../models/User.js'
import type { CreateUserData, UpdateUserData } from '../types/user.js'
import { validateUserData, validateUpdateUserData } from '../utils/validation.js'

// 检查用户是否为管理员
const isAdminUser = async (userId: number): Promise<boolean> => {
  try {
    const userRoles = await UserModel.getUserRoles(userId)
    return userRoles.includes('admin')
  } catch (error) {
    console.error('检查用户角色失败:', error)
    return false
  }
}

export class UserController {
  // 获取所有用户
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.findAll()
      res.json({
        success: true,
        data: users,
        message: '获取用户列表成功',
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取用户列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 根据ID获取用户
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的用户ID',
        })
        return
      }

      const user = await UserModel.findById(id)

      if (!user) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        })
        return
      }

      res.json({
        success: true,
        data: user,
        message: '获取用户信息成功',
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      res.status(500).json({
        success: false,
        message: '获取用户信息失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // 从JWT token中获取用户ID
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问',
        })
        return
      }

      const currentUser = await UserModel.findByIdWithRoles(Number(userId))

      if (!currentUser) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        })
        return
      }

      res.json({
        success: true,
        data: currentUser,
        message: '获取当前用户信息成功',
      })
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      res.status(500).json({
        success: false,
        message: '获取当前用户信息失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 创建用户
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserData = req.body

      // 验证数据
      const { error } = validateUserData(userData)
      if (error) {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          error: error.details[0].message,
        })
        return
      }

      // 检查邮箱是否已存在
      const existingUser = await UserModel.findByEmail(userData.email)
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: '邮箱已存在',
        })
        return
      }

      const newUser = await UserModel.create(userData)

      res.status(201).json({
        success: true,
        data: newUser,
        message: '用户创建成功',
      })
    } catch (error) {
      console.error('创建用户失败:', error)
      res.status(500).json({
        success: false,
        message: '创建用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 更新用户
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)
      const userData: UpdateUserData = req.body

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的用户ID',
        })
        return
      }

      // 验证数据
      const { error } = validateUpdateUserData(userData)
      if (error) {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          error: error.details[0].message,
        })
        return
      }

      // 检查用户是否存在
      const existingUser = await UserModel.findById(id)
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        })
        return
      }

      // 检查是否为管理员用户
      const isAdmin = await isAdminUser(id)
      if (isAdmin) {
        // 禁止修改管理员用户的状态
        if (userData.status && userData.status !== existingUser.status) {
          res.status(403).json({
            success: false,
            message: '禁止修改管理员用户状态',
          })
          return
        }
      }

      // 如果更新邮箱，检查新邮箱是否已存在
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await UserModel.findByEmail(userData.email)
        if (emailExists) {
          res.status(409).json({
            success: false,
            message: '邮箱已存在',
          })
          return
        }
      }

      const updatedUser = await UserModel.update(id, userData)

      res.json({
        success: true,
        data: updatedUser,
        message: '用户更新成功',
      })
    } catch (error) {
      console.error('更新用户失败:', error)
      res.status(500).json({
        success: false,
        message: '更新用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 删除用户
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: '无效的用户ID',
        })
        return
      }

      // 检查用户是否存在
      const existingUser = await UserModel.findById(id)
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        })
        return
      }

      // 检查是否为管理员用户
      const isAdmin = await isAdminUser(id)
      if (isAdmin) {
        res.status(403).json({
          success: false,
          message: '禁止删除管理员用户',
        })
        return
      }

      const deleted = await UserModel.delete(id)

      if (!deleted) {
        res.status(500).json({
          success: false,
          message: '删除用户失败',
        })
        return
      }

      res.json({
        success: true,
        message: '用户删除成功',
      })
    } catch (error) {
      console.error('删除用户失败:', error)
      res.status(500).json({
        success: false,
        message: '删除用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }
}
