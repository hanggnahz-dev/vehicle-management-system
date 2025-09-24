import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
// SQLite数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
// 数据库实例
let db = null;
// 获取数据库连接
export const getDatabase = async () => {
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
    }
    return db;
};
// 连接数据库
export const connectDatabase = async () => {
    try {
        const database = await getDatabase();
        console.log('✅ SQLite数据库连接成功');
        // 创建数据目录（如果不存在）
        const fs = await import('fs');
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        // 创建表
        await createTables(database);
        console.log('✅ 数据库初始化完成');
    }
    catch (error) {
        console.error('❌ 数据库连接失败:', error);
        throw error;
    }
};
// 创建所有表
const createTables = async (database) => {
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
    `);
        console.log('✅ 用户表创建成功');
        // 创建角色表
        await database.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ 角色表创建成功');
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
    `);
        console.log('✅ 用户角色关联表创建成功');
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
    `);
        console.log('✅ 车辆表创建成功');
        // 插入示例数据
        await insertSampleData(database);
    }
    catch (error) {
        console.error('❌ 创建表失败:', error);
        throw error;
    }
};
// 插入示例数据
const insertSampleData = async (database) => {
    try {
        // 检查用户数据
        const userCount = await database.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            // 插入用户数据
            await database.exec(`
        INSERT INTO users (name, email, password, status) VALUES
        ('张三', 'zhangsan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
        ('李四', 'lisi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'inactive')
      `);
            console.log('✅ 用户示例数据插入成功');
        }
        // 检查角色数据
        const roleCount = await database.get('SELECT COUNT(*) as count FROM roles');
        if (roleCount.count === 0) {
            // 插入角色数据
            await database.exec(`
        INSERT INTO roles (name, description) VALUES
        ('管理员', '系统管理员，拥有所有权限'),
        ('普通用户', '普通用户，拥有基本权限')
      `);
            console.log('✅ 角色示例数据插入成功');
        }
        // 检查车辆数据
        const vehicleCount = await database.get('SELECT COUNT(*) as count FROM vehicles');
        if (vehicleCount.count === 0) {
            // 插入车辆数据
            await database.exec(`
        INSERT INTO vehicles (company_name, license_plate, inspection_date) VALUES
        ('北京运输有限公司', '京A12345', '2024-12-31'),
        ('上海物流集团', '沪B67890', '2024-11-15'),
        ('广州货运公司', '粤C11111', '2024-10-20'),
        ('深圳快运有限公司', '粤D22222', '2024-09-30'),
        ('上海物流集团', '沪A88888', '2025-03-15')
      `);
            console.log('✅ 车辆示例数据插入成功');
        }
    }
    catch (error) {
        console.error('❌ 插入示例数据失败:', error);
    }
};
export default getDatabase;
//# sourceMappingURL=database.js.map