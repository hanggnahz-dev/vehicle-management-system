import { Router } from 'express';
import { RoleController } from '../controllers/roleController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// 获取角色列表
router.get('/', authenticateToken, RoleController.getRoles);
// 根据ID获取角色
router.get('/:id', authenticateToken, RoleController.getRoleById);
// 创建角色
router.post('/', authenticateToken, RoleController.createRole);
// 更新角色
router.put('/:id', authenticateToken, RoleController.updateRole);
// 删除角色
router.delete('/:id', authenticateToken, RoleController.deleteRole);
// 获取角色用户
router.get('/:id/users', authenticateToken, RoleController.getRoleUsers);
export default router;
//# sourceMappingURL=roleRoutes.js.map