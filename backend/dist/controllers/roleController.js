import { RoleModel } from '../models/Role.js';
import { validateRoleData, validateUpdateRoleData } from '../utils/validation.js';
export class RoleController {
    // 获取角色列表
    static async getRoles(req, res) {
        try {
            const roles = await RoleModel.findAll();
            res.json({
                success: true,
                data: roles,
                message: '获取角色列表成功',
            });
        }
        catch (error) {
            console.error('获取角色列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取角色列表失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 根据ID获取角色
    static async getRoleById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的角色ID',
                });
                return;
            }
            const role = await RoleModel.findById(id);
            if (!role) {
                res.status(404).json({
                    success: false,
                    message: '角色不存在',
                });
                return;
            }
            res.json({
                success: true,
                data: role,
                message: '获取角色信息成功',
            });
        }
        catch (error) {
            console.error('获取角色信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取角色信息失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 创建角色
    static async createRole(req, res) {
        try {
            const roleData = req.body;
            // 验证数据
            const { error } = validateRoleData(roleData);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    error: error.details[0].message,
                });
                return;
            }
            // 检查角色名称是否已存在
            const existingRole = await RoleModel.findByName(roleData.name);
            if (existingRole) {
                res.status(409).json({
                    success: false,
                    message: '角色名称已存在',
                });
                return;
            }
            const newRole = await RoleModel.create(roleData);
            res.status(201).json({
                success: true,
                data: newRole,
                message: '角色创建成功',
            });
        }
        catch (error) {
            console.error('创建角色失败:', error);
            res.status(500).json({
                success: false,
                message: '创建角色失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 更新角色
    static async updateRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const roleData = req.body;
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的角色ID',
                });
                return;
            }
            // 验证数据
            const { error } = validateUpdateRoleData(roleData);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    error: error.details[0].message,
                });
                return;
            }
            // 检查角色是否存在
            const existingRole = await RoleModel.findById(id);
            if (!existingRole) {
                res.status(404).json({
                    success: false,
                    message: '角色不存在',
                });
                return;
            }
            // 如果更新角色名称，检查新名称是否已存在
            if (roleData.name && roleData.name !== existingRole.name) {
                const nameExists = await RoleModel.findByName(roleData.name);
                if (nameExists) {
                    res.status(409).json({
                        success: false,
                        message: '角色名称已存在',
                    });
                    return;
                }
            }
            const updatedRole = await RoleModel.update(id, roleData);
            res.json({
                success: true,
                data: updatedRole,
                message: '角色更新成功',
            });
        }
        catch (error) {
            console.error('更新角色失败:', error);
            res.status(500).json({
                success: false,
                message: '更新角色失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 删除角色
    static async deleteRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的角色ID',
                });
                return;
            }
            // 检查角色是否存在
            const existingRole = await RoleModel.findById(id);
            if (!existingRole) {
                res.status(404).json({
                    success: false,
                    message: '角色不存在',
                });
                return;
            }
            const deleted = await RoleModel.delete(id);
            if (!deleted) {
                res.status(500).json({
                    success: false,
                    message: '删除角色失败',
                });
                return;
            }
            res.json({
                success: true,
                message: '角色删除成功',
            });
        }
        catch (error) {
            console.error('删除角色失败:', error);
            res.status(500).json({
                success: false,
                message: '删除角色失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 获取角色用户
    static async getRoleUsers(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的角色ID',
                });
                return;
            }
            const users = await RoleModel.getRoleUsers(id);
            res.json({
                success: true,
                data: users,
                message: '获取角色用户成功',
            });
        }
        catch (error) {
            console.error('获取角色用户失败:', error);
            res.status(500).json({
                success: false,
                message: '获取角色用户失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
}
//# sourceMappingURL=roleController.js.map