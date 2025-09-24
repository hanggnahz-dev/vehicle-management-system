import { UserModel } from '../models/User.js';
import { validateUserData, validateUpdateUserData } from '../utils/validation.js';
export class UserController {
    // 获取所有用户
    static async getUsers(req, res) {
        try {
            const users = await UserModel.findAll();
            res.json({
                success: true,
                data: users,
                message: '获取用户列表成功'
            });
        }
        catch (error) {
            console.error('获取用户列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户列表失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    // 根据ID获取用户
    static async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的用户ID'
                });
                return;
            }
            const user = await UserModel.findById(id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
                return;
            }
            res.json({
                success: true,
                data: user,
                message: '获取用户信息成功'
            });
        }
        catch (error) {
            console.error('获取用户信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户信息失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    // 获取当前用户信息
    static async getCurrentUser(req, res) {
        try {
            // 这里应该从JWT token中获取用户ID
            // 暂时返回第一个用户作为示例
            const users = await UserModel.findAll();
            const currentUser = users[0] || null;
            if (!currentUser) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
                return;
            }
            res.json({
                success: true,
                data: currentUser,
                message: '获取当前用户信息成功'
            });
        }
        catch (error) {
            console.error('获取当前用户信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取当前用户信息失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    // 创建用户
    static async createUser(req, res) {
        try {
            const userData = req.body;
            // 验证数据
            const { error } = validateUserData(userData);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    error: error.details[0].message
                });
                return;
            }
            // 检查邮箱是否已存在
            const existingUser = await UserModel.findByEmail(userData.email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: '邮箱已存在'
                });
                return;
            }
            const newUser = await UserModel.create(userData);
            res.status(201).json({
                success: true,
                data: newUser,
                message: '用户创建成功'
            });
        }
        catch (error) {
            console.error('创建用户失败:', error);
            res.status(500).json({
                success: false,
                message: '创建用户失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    // 更新用户
    static async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            const userData = req.body;
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的用户ID'
                });
                return;
            }
            // 验证数据
            const { error } = validateUpdateUserData(userData);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: '数据验证失败',
                    error: error.details[0].message
                });
                return;
            }
            // 检查用户是否存在
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
                return;
            }
            // 如果更新邮箱，检查新邮箱是否已存在
            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = await UserModel.findByEmail(userData.email);
                if (emailExists) {
                    res.status(409).json({
                        success: false,
                        message: '邮箱已存在'
                    });
                    return;
                }
            }
            const updatedUser = await UserModel.update(id, userData);
            res.json({
                success: true,
                data: updatedUser,
                message: '用户更新成功'
            });
        }
        catch (error) {
            console.error('更新用户失败:', error);
            res.status(500).json({
                success: false,
                message: '更新用户失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
    // 删除用户
    static async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: '无效的用户ID'
                });
                return;
            }
            // 检查用户是否存在
            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
                return;
            }
            const deleted = await UserModel.delete(id);
            if (!deleted) {
                res.status(500).json({
                    success: false,
                    message: '删除用户失败'
                });
                return;
            }
            res.json({
                success: true,
                message: '用户删除成功'
            });
        }
        catch (error) {
            console.error('删除用户失败:', error);
            res.status(500).json({
                success: false,
                message: '删除用户失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
    }
}
//# sourceMappingURL=userController.js.map