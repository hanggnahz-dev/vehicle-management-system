import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
const router = Router();
// 获取所有用户
router.get('/', UserController.getUsers);
// 获取当前用户信息
router.get('/me', UserController.getCurrentUser);
// 根据ID获取用户
router.get('/:id', UserController.getUserById);
// 创建用户
router.post('/', UserController.createUser);
// 更新用户
router.put('/:id', UserController.updateUser);
// 删除用户
router.delete('/:id', UserController.deleteUser);
export default router;
//# sourceMappingURL=userRoutes.js.map