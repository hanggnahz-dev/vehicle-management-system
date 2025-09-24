import { getDatabase } from '../config/database.js'
import type { Role, CreateRoleData, UpdateRoleData, RoleResponse } from '../types/role.js'

export class RoleModel {
  // 获取所有角色
  static async findAll(): Promise<RoleResponse[]> {
    const db = await getDatabase()
    const rows = (await db.all(
      'SELECT id, name, description, created_at, updated_at FROM roles ORDER BY created_at DESC'
    )) as Role[]

    return rows.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }))
  }

  // 根据ID获取角色
  static async findById(id: number): Promise<RoleResponse | null> {
    const db = await getDatabase()
    const role = (await db.get(
      'SELECT id, name, description, created_at, updated_at FROM roles WHERE id = ?',
      [id]
    )) as Role | undefined

    if (!role) {
      return null
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      created_at: role.created_at,
      updated_at: role.updated_at,
    }
  }

  // 根据名称获取角色
  static async findByName(name: string): Promise<Role | null> {
    const db = await getDatabase()
    const role = (await db.get('SELECT * FROM roles WHERE name = ?', [name])) as Role | undefined

    return role || null
  }

  // 创建角色
  static async create(roleData: CreateRoleData): Promise<RoleResponse> {
    const { name, description } = roleData

    const db = await getDatabase()
    const result = await db.run('INSERT INTO roles (name, description) VALUES (?, ?)', [
      name,
      description,
    ])

    const newRole = await this.findById(result.lastID!)
    if (!newRole) {
      throw new Error('创建角色失败')
    }

    return newRole
  }

  // 更新角色
  static async update(id: number, roleData: UpdateRoleData): Promise<RoleResponse | null> {
    const fields: string[] = []
    const values: any[] = []

    if (roleData.name !== undefined) {
      fields.push('name = ?')
      values.push(roleData.name)
    }

    if (roleData.description !== undefined) {
      fields.push('description = ?')
      values.push(roleData.description)
    }

    if (fields.length === 0) {
      return await this.findById(id)
    }

    values.push(id)

    const db = await getDatabase()
    await db.run(`UPDATE roles SET ${fields.join(', ')} WHERE id = ?`, values)

    return await this.findById(id)
  }

  // 删除角色
  static async delete(id: number): Promise<boolean> {
    const db = await getDatabase()
    const result = await db.run('DELETE FROM roles WHERE id = ?', [id])

    return result.changes! > 0
  }

  // 获取角色的用户
  static async getRoleUsers(roleId: number): Promise<any[]> {
    const db = await getDatabase()
    const rows = await db.all(
      `SELECT u.id, u.name, u.email, u.status 
       FROM users u 
       INNER JOIN user_roles ur ON u.id = ur.user_id 
       WHERE ur.role_id = ?`,
      [roleId]
    )

    return rows
  }
}
