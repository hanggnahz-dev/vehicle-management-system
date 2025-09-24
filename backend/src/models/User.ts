import { getDatabase } from '../config/database.js'
import type { User, CreateUserData, UpdateUserData, UserResponse } from '../types/user.js'
import bcrypt from 'bcryptjs'

export class UserModel {
  // 获取所有用户
  static async findAll(): Promise<UserResponse[]> {
    const db = await getDatabase()
    const rows = (await db.all(
      'SELECT id, name, email, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    )) as User[]

    return rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))
  }

  // 根据ID获取用户
  static async findById(id: number): Promise<UserResponse | null> {
    const db = await getDatabase()
    const user = (await db.get(
      'SELECT id, name, email, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    )) as User | undefined

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }

  // 根据邮箱获取用户（包含密码）
  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase()
    const user = (await db.get('SELECT * FROM users WHERE email = ?', [email])) as User | undefined

    return user || null
  }

  // 创建用户
  static async create(userData: CreateUserData): Promise<UserResponse> {
    const { name, email, password, status = 'active' } = userData

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    const db = await getDatabase()
    const result = await db.run(
      'INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, status]
    )

    const newUser = await this.findById(result.lastID!)
    if (!newUser) {
      throw new Error('创建用户失败')
    }

    return newUser
  }

  // 更新用户
  static async update(id: number, userData: UpdateUserData): Promise<UserResponse | null> {
    const fields: string[] = []
    const values: any[] = []

    if (userData.name !== undefined) {
      fields.push('name = ?')
      values.push(userData.name)
    }

    if (userData.email !== undefined) {
      fields.push('email = ?')
      values.push(userData.email)
    }

    if (userData.password !== undefined && userData.password.trim() !== '') {
      fields.push('password = ?')
      values.push(await bcrypt.hash(userData.password, 10))
    }

    if (userData.status !== undefined) {
      fields.push('status = ?')
      values.push(userData.status)
    }

    if (fields.length === 0) {
      return await this.findById(id)
    }

    values.push(id)

    const db = await getDatabase()
    const result = await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)

    return await this.findById(id)
  }

  // 删除用户
  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.run('DELETE FROM users WHERE id = ?', [id])

    return result.changes! > 0
  }

  // 验证密码
  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // 获取用户角色
  static async getUserRoles(userId: number): Promise<string[]> {
    const db = await getDatabase()
    const rows = await db.all(
      `SELECT r.name 
       FROM roles r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = ?`,
      [userId]
    )

    return rows.map((row: any) => row.name)
  }

  // 获取用户信息（包含角色）
  static async findByIdWithRoles(id: number): Promise<(UserResponse & { roles: string[] }) | null> {
    const user = await this.findById(id)
    if (!user) {
      return null
    }

    const roles = await this.getUserRoles(id)
    return { ...user, roles }
  }
}
