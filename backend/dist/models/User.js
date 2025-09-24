import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
export class UserModel {
    // 获取所有用户
    static async findAll() {
        const db = await getDatabase();
        const rows = (await db.all('SELECT id, name, email, status, created_at, updated_at FROM users ORDER BY created_at DESC'));
        return rows.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }));
    }
    // 根据ID获取用户
    static async findById(id) {
        const db = await getDatabase();
        const user = (await db.get('SELECT id, name, email, status, created_at, updated_at FROM users WHERE id = ?', [id]));
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
    // 根据邮箱获取用户（包含密码）
    static async findByEmail(email) {
        const db = await getDatabase();
        const user = (await db.get('SELECT * FROM users WHERE email = ?', [email]));
        return user || null;
    }
    // 创建用户
    static async create(userData) {
        const { name, email, password, status = 'active' } = userData;
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        const db = await getDatabase();
        const result = await db.run('INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, status]);
        const newUser = await this.findById(result.lastID);
        if (!newUser) {
            throw new Error('创建用户失败');
        }
        return newUser;
    }
    // 更新用户
    static async update(id, userData) {
        const fields = [];
        const values = [];
        if (userData.name !== undefined) {
            fields.push('name = ?');
            values.push(userData.name);
        }
        if (userData.email !== undefined) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        if (userData.password !== undefined && userData.password.trim() !== '') {
            fields.push('password = ?');
            values.push(await bcrypt.hash(userData.password, 10));
        }
        if (userData.status !== undefined) {
            fields.push('status = ?');
            values.push(userData.status);
        }
        if (fields.length === 0) {
            return await this.findById(id);
        }
        values.push(id);
        const db = await getDatabase();
        const result = await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return await this.findById(id);
    }
    // 删除用户
    static async delete(id) {
        const db = await getDatabase();
        const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
        return result.changes > 0;
    }
    // 验证密码
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    // 获取用户角色
    static async getUserRoles(userId) {
        const db = await getDatabase();
        const rows = await db.all(`SELECT r.name 
       FROM roles r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = ?`, [userId]);
        return rows.map((row) => row.name);
    }
    // 获取用户信息（包含角色）
    static async findByIdWithRoles(id) {
        const user = await this.findById(id);
        if (!user) {
            return null;
        }
        const roles = await this.getUserRoles(id);
        return { ...user, roles };
    }
}
//# sourceMappingURL=User.js.map