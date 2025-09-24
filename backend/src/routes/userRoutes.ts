import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { authenticateToken } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = Router()

// 普通用户也可以访问的路由（必须在参数路由之前定义）
router.get('/me', authenticateToken, UserController.getCurrentUser)

// 需要admin权限的路由
router.get('/', authenticateToken, requireAdmin, UserController.getUsers)
router.get('/:id', authenticateToken, requireAdmin, UserController.getUserById)
router.post('/', authenticateToken, requireAdmin, UserController.createUser)
router.put('/:id', authenticateToken, requireAdmin, UserController.updateUser)
router.delete('/:id', authenticateToken, requireAdmin, UserController.deleteUser)

export default router
