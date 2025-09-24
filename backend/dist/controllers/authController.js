import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { validateLoginData } from '../utils/validation.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export class AuthController {
    // 用户登录
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // 验证输入数据
            const { error } = validateLoginData({ email, password });
            if (error) {
                res.status(400).json({
                    success: false,
                    message: '输入数据验证失败',
                    error: error.details[0].message,
                });
                return;
            }
            // 查找用户
            const user = await UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误',
                });
                return;
            }
            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: '邮箱或密码错误',
                });
                return;
            }
            // 检查用户状态
            if (user.status !== 'active') {
                res.status(401).json({
                    success: false,
                    message: '账户已被禁用',
                });
                return;
            }
            // 生成JWT token
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
                name: user.name,
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            // 返回用户信息和token
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        status: user.status,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                    },
                },
                message: '登录成功',
            });
        }
        catch (error) {
            console.error('登录失败:', error);
            res.status(500).json({
                success: false,
                message: '登录失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 获取当前用户信息
    static async getCurrentUser(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问',
                });
                return;
            }
            const user = await UserModel.findByIdWithRoles(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在',
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: user.status,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    roles: user.roles,
                },
                message: '获取用户信息成功',
            });
        }
        catch (error) {
            console.error('获取用户信息失败:', error);
            res.status(500).json({
                success: false,
                message: '获取用户信息失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 用户登出
    static async logout(req, res) {
        try {
            // 在实际应用中，可以将token加入黑名单
            // 这里简单返回成功响应
            res.json({
                success: true,
                message: '登出成功',
            });
        }
        catch (error) {
            console.error('登出失败:', error);
            res.status(500).json({
                success: false,
                message: '登出失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    // 刷新token
    static async refreshToken(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问',
                });
                return;
            }
            const user = await UserModel.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: '用户不存在',
                });
                return;
            }
            // 生成新的token
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
                name: user.name,
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.json({
                success: true,
                data: { token },
                message: 'Token刷新成功',
            });
        }
        catch (error) {
            console.error('Token刷新失败:', error);
            res.status(500).json({
                success: false,
                message: 'Token刷新失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
}
//# sourceMappingURL=authController.js.map