# Vue3 + Node.js 全栈项目

一个现代化的前后端分离全栈应用，使用 Vue3、Node.js、SQLite 等技术栈构建。

## 🚀 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Pinia** - Vue 状态管理
- **Axios** - HTTP 客户端
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具

### 后端

- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **SQLite** - 轻量级数据库
- **TypeScript** - 类型安全的 JavaScript
- **JWT** - 身份验证
- **Joi** - 数据验证

### 部署与运维

- **Docker** - 容器化
- **Docker Compose** - 容器编排
- **Nginx** - 反向代理
- **PM2** - 进程管理
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

## 🚀 功能特性

### 📋 业务功能

- 🚗 **车辆管理系统**

  - 车辆信息管理（公司名称、车牌号、审证日期）
  - 支持按公司、车牌号、审证日期筛选
  - 文件拖拽上传导入数据
  - 审证到期提醒功能

- 👥 **用户管理系统**

  - 用户增删改查
  - 用户状态管理

- 🔐 **角色管理系统**
  - 角色管理（管理员、部门经理、操作员、查看者）
  - 用户角色分配
  - 基于角色的访问控制

## 📁 项目结构

```
fullstack-project/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── views/           # 页面
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # API 接口
│   │   ├── utils/           # 工具函数
│   │   └── assets/          # 静态资源
│   ├── Dockerfile           # 前端 Docker 配置
│   └── package.json
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   ├── config/          # 配置文件
│   │   └── types/           # 类型定义
│   ├── Dockerfile           # 后端 Docker 配置
│   ├── ecosystem.config.js  # PM2 配置
│   └── package.json
├── nginx/                   # Nginx 配置
│   └── nginx.conf
├── docker/                  # Docker 相关文件
│   ├── mysql/
│   └── start.sh
├── pm2/                     # PM2 配置
│   ├── ecosystem.config.js
│   └── start.sh
├── docker-compose.yml       # Docker Compose 配置
└── README.md
```

## 🛠️ 快速开始

### 环境要求

- Node.js >= 18.0.0
- Docker >= 20.0.0 (可选，用于完整部署)
- Docker Compose >= 2.0.0 (可选，用于完整部署)
- SQLite (自动创建，无需额外安装)

### 🚀 一键部署

#### Root 用户部署（推荐）

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行root用户部署脚本
chmod +x deploy-ubuntu-root.sh
./deploy-ubuntu-root.sh
```

#### 普通用户部署

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行普通用户部署脚本（需要sudo权限）
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

**注意：** Root 用户部署脚本专门为 root 用户优化，无需 sudo 权限，部署过程更简洁高效。

#### 阿里云 ECS 部署

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行阿里云部署脚本
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh
```

**阿里云部署特性：**

- ✅ 自动配置阿里云安全组
- ✅ 自动申请 SSL 证书
- ✅ 支持域名和 IP 访问
- ✅ 自动配置防火墙
- ✅ 支持 Ubuntu/CentOS/Alibaba Cloud Linux

### 🍎 Mac 用户快速开始

如果您使用的是 Mac 系统，推荐使用以下方式快速启动：

```bash
# 方式一：本地开发（推荐，使用SQLite数据库）
./start-local-sqlite.sh

# 方式二：本地开发（使用模拟数据）
./start-local.sh

# 方式三：完整环境（需要Docker）
./start-mac.sh

# 方式三：快速启动
./quick-start.sh
```

详细说明请参考 [Mac 开发环境指南](README-MAC.md)

### 1. 克隆项目

```bash
git clone <repository-url>
cd fullstack-project
```

### 2. 使用 Docker 启动（推荐）

```bash
# 启动所有服务
./docker/start.sh

# 或者手动启动
docker-compose up --build -d
```

### 3. 手动启动

#### 启动数据库

```bash
# 使用 Docker 启动完整环境
docker-compose up -d
```

#### 启动后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp env.example .env

# 启动开发服务器
npm run dev
```

#### 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🌐 访问地址

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:5000
- **Nginx 代理**: http://localhost:80
- **数据库**: localhost:3306

## 📝 API 文档

### 用户接口

| 方法   | 路径             | 描述         |
| ------ | ---------------- | ------------ |
| GET    | `/api/users`     | 获取用户列表 |
| GET    | `/api/users/:id` | 获取用户详情 |
| GET    | `/api/users/me`  | 获取当前用户 |
| POST   | `/api/users`     | 创建用户     |
| PUT    | `/api/users/:id` | 更新用户     |
| DELETE | `/api/users/:id` | 删除用户     |

### 请求示例

```bash
# 获取用户列表
curl http://localhost:5000/api/users

# 创建用户
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "password": "123456"
  }'
```

## 🔧 开发命令

### 前端

```bash
cd frontend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 后端

```bash
cd backend

# 开发模式
npm run dev

# 构建
npm run build

# 启动生产版本
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🐳 Docker 命令

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart backend

# 进入容器
docker-compose exec backend bash
```

## 🔄 PM2 命令

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart all

# 停止应用
pm2 stop all

# 删除应用
pm2 delete all
```

## 🗄️ 数据库

### 连接信息

- **主机**: localhost
- **端口**: 3306
- **数据库**: fullstack_db
- **用户名**: root
- **密码**: password

### 表结构

#### users 表

| 字段       | 类型         | 说明                  |
| ---------- | ------------ | --------------------- |
| id         | INT          | 主键，自增            |
| name       | VARCHAR(100) | 用户名                |
| email      | VARCHAR(100) | 邮箱，唯一            |
| password   | VARCHAR(255) | 密码（加密）          |
| status     | ENUM         | 状态：active/inactive |
| created_at | TIMESTAMP    | 创建时间              |
| updated_at | TIMESTAMP    | 更新时间              |

## 🔒 环境变量

### 后端环境变量

```bash
# 服务器配置
PORT=5000
NODE_ENV=production

# 数据库配置 (SQLite)
# SQLite数据库文件将自动创建在 ./data/database.sqlite

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

## 🚀 部署

### 生产环境部署

1. **准备服务器**

   ```bash
   # 安装 Docker 和 Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **部署应用**

   ```bash
   # 克隆代码
   git clone <repository-url>
   cd fullstack-project

   # 启动服务
   docker-compose up --build -d
   ```

3. **配置域名和 SSL**
   - 修改 `nginx/nginx.conf` 中的域名配置
   - 添加 SSL 证书到 `nginx/ssl/` 目录

### 监控和日志

```bash
# 查看应用日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend

# 查看 PM2 日志
pm2 logs
```

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如果您遇到任何问题或有任何建议，请：

1. 查看 [Issues](https://github.com/your-username/your-repo/issues)
2. 创建新的 Issue
3. 联系维护者

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
