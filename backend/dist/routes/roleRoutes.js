import { Router } from 'express';
import { RoleController } from '../controllers/roleController.js';
const router = Router();
// 获取角色列表
router.get('/', RoleController.getRoles);
// 根据ID获取角色
router.get('/:id', RoleController.getRoleById);
// 创建角色
router.post('/', RoleController.createRole);
// 更新角色
router.put('/:id', RoleController.updateRole);
// 删除角色
router.delete('/:id', RoleController.deleteRole);
// 获取角色用户
router.get('/:id/users', RoleController.getRoleUsers);
export default router;
//# sourceMappingURL=roleRoutes.js.map