-- SQLite数据库初始化脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- 创建车辆表
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    inspection_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT OR IGNORE INTO users (name, email, password, status) VALUES
('张三', 'zhangsan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
('李四', 'lisi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'inactive');

-- 插入角色数据
INSERT OR IGNORE INTO roles (name, description) VALUES
('管理员', '系统管理员，拥有所有权限'),
('普通用户', '普通用户，拥有基本权限');

-- 插入用户角色关联数据
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), -- 张三 - 管理员
(2, 2); -- 李四 - 普通用户

-- 插入车辆示例数据
INSERT OR IGNORE INTO vehicles (company_name, license_plate, inspection_date) VALUES
('北京运输有限公司', '京A12345', '2024-12-31'),
('上海物流集团', '沪B67890', '2024-11-15'),
('广州货运公司', '粤C11111', '2024-10-20'),
('深圳快运有限公司', '粤D22222', '2024-09-30'),
('上海物流集团', '沪A88888', '2025-03-15');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_inspection_date ON vehicles(inspection_date);
