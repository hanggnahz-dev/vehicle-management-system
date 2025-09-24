import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/User.js'
import { RoleModel } from '../models/Role.js'
import { getDatabase } from '../config/database.js'

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        name: string
        status: string
      }
    }
  }
}

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从JWT token中获取用户ID（这里假设已经通过authenticateToken中间件）
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
      })
      return
    }

    // 检查用户是否存在且为活跃状态
    const user = await UserModel.findById(userId)
    if (!user || user.status !== 'active') {
      res.status(403).json({
        success: false,
        message: '用户不存在或已被禁用',
      })
      return
    }

    // 检查用户是否为admin角色
    const db = await getDatabase()
    const adminRole = await RoleModel.findByName('admin')

    if (!adminRole) {
      res.status(500).json({
        success: false,
        message: '系统配置错误：admin角色不存在',
      })
      return
    }

    // 检查用户是否具有admin角色
    const userRole = await db.get('SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?', [
      userId,
      adminRole.id,
    ])

    if (!userRole) {
      res.status(403).json({
        success: false,
        message: '权限不足：需要管理员权限',
      })
      return
    }

    // 将用户信息添加到请求对象中
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    }

    next()
  } catch (error) {
    console.error('Admin权限检查失败:', error)
    res.status(500).json({
      success: false,
      message: '权限检查失败',
      error: error instanceof Error ? error.message : '未知错误',
    })
  }
}
