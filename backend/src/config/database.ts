import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// SQLite数据库文件路径
// 优先使用环境变量指定的路径，否则使用项目目录下的data文件夹
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite')

// 数据库实例
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

// 获取数据库连接
export const getDatabase = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  }
  return db
}

// 连接数据库
export const connectDatabase = async (): Promise<void> => {
  try {
    // 创建数据目录（如果不存在）
    const fs = await import('fs')
    const dataDir = path.dirname(dbPath)

    console.log(`📁 数据库路径: ${dbPath}`)
    console.log(`📁 数据目录: ${dataDir}`)

    // 确保数据目录存在
    if (!fs.existsSync(dataDir)) {
      console.log(`📁 创建数据目录: ${dataDir}`)
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 })
    }

    // 检查目录权限
    try {
      fs.accessSync(dataDir, fs.constants.W_OK)
      console.log('✅ 数据目录写入权限检查通过')
    } catch (permError) {
      console.error('❌ 数据目录没有写入权限:', permError)
      throw new Error(`数据目录没有写入权限: ${dataDir}`)
    }

    const database = await getDatabase()
    console.log('✅ SQLite数据库连接成功')

    // 创建表
    await createTables(database)

    console.log('✅ 数据库初始化完成')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    console.error('❌ 错误详情:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

// 创建所有表
const createTables = async (
  database: Database<sqlite3.Database, sqlite3.Statement>
): Promise<void> => {
  try {
    // 创建用户表
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ 用户表创建成功')

    // 创建角色表
    await database.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ 角色表创建成功')

    // 创建用户角色关联表
    await database.exec(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE(user_id, role_id)
      )
    `)
    console.log('✅ 用户角色关联表创建成功')

    // 创建车辆表
    await database.exec(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        license_plate TEXT NOT NULL UNIQUE,
        inspection_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ 车辆表创建成功')

    // 插入示例数据
    await insertSampleData(database)
  } catch (error) {
    console.error('❌ 创建表失败:', error)
    throw error
  }
}

// 插入示例数据
const insertSampleData = async (
  database: Database<sqlite3.Database, sqlite3.Statement>
): Promise<void> => {
  try {
    // 检查用户数据
    const userCount = (await database.get('SELECT COUNT(*) as count FROM users')) as {
      count: number
    }

    if (userCount.count === 0) {
      // 插入用户数据（包含默认管理员账户）
      await database.exec(`
        INSERT INTO users (name, email, password, status) VALUES
        ('管理员', 'admin@example.com', '$2a$10$XPzFO.o8yKIJVJAdX6rYi.czl1haGQ9ms2aErHsJzdvkwc.5clByq', 'active'),
        ('张三', 'zhangsan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
        ('李四', 'lisi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'inactive')
      `)
      console.log('✅ 用户示例数据插入成功')
      console.log('🔑 默认管理员账户: admin@example.com / admin123')
    }

    // 检查角色数据
    const roleCount = (await database.get('SELECT COUNT(*) as count FROM roles')) as {
      count: number
    }

    if (roleCount.count === 0) {
      // 插入角色数据
      await database.exec(`
        INSERT INTO roles (name, description) VALUES
        ('admin', '系统管理员，拥有所有权限'),
        ('user', '普通用户，拥有基本权限')
      `)
      console.log('✅ 角色示例数据插入成功')
    }

    // 检查用户角色关联数据
    const userRoleCount = (await database.get('SELECT COUNT(*) as count FROM user_roles')) as {
      count: number
    }

    if (userRoleCount.count === 0) {
      // 获取admin角色ID
      const adminRole = (await database.get('SELECT id FROM roles WHERE name = ?', ['admin'])) as {
        id: number
      }

      // 获取admin用户ID
      const adminUser = (await database.get('SELECT id FROM users WHERE email = ?', [
        'admin@example.com',
      ])) as {
        id: number
      }

      if (adminRole && adminUser) {
        // 为admin用户分配admin角色
        await database.exec(`
          INSERT INTO user_roles (user_id, role_id) VALUES
          (${adminUser.id}, ${adminRole.id})
        `)
        console.log('✅ 管理员角色分配成功')
      }
    }

    // 检查车辆数据
    const vehicleCount = (await database.get('SELECT COUNT(*) as count FROM vehicles')) as {
      count: number
    }

    if (vehicleCount.count === 0) {
      // 插入车辆数据
      await database.exec(`
        INSERT INTO vehicles (company_name, license_plate, inspection_date) VALUES
        ('北京运输有限公司', '京A12345', '2024-12-31'),
        ('上海物流集团', '沪B67890', '2024-11-15'),
        ('广州货运公司', '粤C11111', '2024-10-20'),
        ('深圳快运有限公司', '粤D22222', '2024-09-30'),
        ('上海物流集团', '沪A88888', '2025-03-15')
      `)
      console.log('✅ 车辆示例数据插入成功')
    }
  } catch (error) {
    console.error('❌ 插入示例数据失败:', error)
  }
}

export default getDatabase
