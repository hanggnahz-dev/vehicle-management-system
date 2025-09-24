import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// 用户登录
router.post('/login', AuthController.login);
// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, AuthController.getCurrentUser);
// 用户登出（需要认证）
router.post('/logout', authenticateToken, AuthController.logout);
// 刷新token（需要认证）
router.post('/refresh', authenticateToken, AuthController.refreshToken);
export default router;
//# sourceMappingURL=authRoutes.js.map