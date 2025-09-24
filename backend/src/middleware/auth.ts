import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JwtPayload {
  userId: number
  email: string
  name: string
  iat: number
  exp: number
}

// 扩展Request类型以包含user信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: '访问令牌缺失',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = decoded
    ;(req as any).userId = decoded.userId
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: '访问令牌已过期',
      })
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '无效的访问令牌',
      })
    } else {
      res.status(401).json({
        success: false,
        message: '令牌验证失败',
      })
    }
  }
}

// 可选认证中间件（不强制要求token）
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
      req.user = decoded
    } catch (error) {
      // 忽略token验证错误，继续执行
    }
  }

  next()
}
