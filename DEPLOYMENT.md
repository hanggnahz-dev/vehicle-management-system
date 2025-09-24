# 车辆管理系统部署指南

本文档提供了在 Ubuntu 服务器上部署车辆管理系统的详细说明。

## 部署方式

### 1. 完整部署（推荐）

适用于全新的 Ubuntu 服务器，自动安装所有依赖。

#### 普通用户部署

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行完整部署脚本（需要sudo权限）
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

#### Root 用户部署

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行root用户部署脚本
chmod +x deploy-ubuntu-root.sh
./deploy-ubuntu-root.sh
```

**注意：** Root 用户部署脚本专门为 root 用户优化，无需 sudo 权限，部署过程更简洁。

### 2. Docker 部署

适用于已有 Docker 环境的服务器。

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行Docker部署脚本
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### 3. 快速部署

适用于已有 Docker 环境的服务器，快速重新部署。

```bash
# 运行快速部署脚本
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## 系统要求

### 最低要求

- Ubuntu 18.04 或更高版本
- 2GB RAM
- 10GB 可用磁盘空间
- 网络连接

### 推荐配置

- Ubuntu 20.04 或更高版本
- 4GB RAM
- 20GB 可用磁盘空间
- 稳定的网络连接

## 部署脚本说明

### deploy-ubuntu.sh

完整部署脚本，包含以下功能：

- 自动安装 Node.js 20.x
- 自动安装 Docker 和 Docker Compose
- 自动安装 PM2
- 配置 systemd 服务
- 配置 Nginx 反向代理
- 配置防火墙
- 自动构建和启动服务

### deploy-docker.sh

Docker 部署脚本，包含以下功能：

- 自动安装 Docker 和 Docker Compose
- 配置 Nginx 反向代理
- 配置防火墙
- 自动构建 Docker 镜像
- 启动 Docker 服务

### quick-deploy.sh

快速部署脚本，包含以下功能：

- 检查 Docker 环境
- 停止现有服务
- 重新构建镜像
- 启动服务

## 部署后访问

部署完成后，您可以通过以下地址访问系统：

- **前端界面**: http://服务器 IP
- **后端 API**: http://服务器 IP/api
- **健康检查**: http://服务器 IP/health

## 默认账户

- **邮箱**: admin@example.com
- **密码**: admin123

## 服务管理

### 使用 systemd 管理（完整部署）

```bash
# 查看后端服务状态
sudo systemctl status vehicle-backend

# 查看前端服务状态
sudo systemctl status vehicle-frontend

# 重启后端服务
sudo systemctl restart vehicle-backend

# 重启前端服务
sudo systemctl restart vehicle-frontend

# 查看服务日志
sudo journalctl -u vehicle-backend -f
sudo journalctl -u vehicle-frontend -f
```

### 使用 Docker 管理

```bash
# 查看容器状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d
```

## 配置文件

### 环境变量

项目根目录下的`.env`文件包含以下配置：

```env
# 环境配置
NODE_ENV=production
PORT=5000

# 数据库配置
DB_PATH=/app/data/database.sqlite

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 前端配置
VITE_API_BASE_URL=http://localhost:5000/api
```

### Nginx 配置

Nginx 配置文件位于：

- 主配置: `/etc/nginx/sites-available/vehicle-management`
- 启用配置: `/etc/nginx/sites-enabled/vehicle-management`

## 数据备份

### 数据库备份

```bash
# 备份SQLite数据库
cp /opt/vehicle-management/data/database.sqlite /backup/database-$(date +%Y%m%d).sqlite
```

### 完整备份

```bash
# 备份整个项目目录
tar -czf /backup/vehicle-management-$(date +%Y%m%d).tar.gz /opt/vehicle-management
```

## 故障排除

### 常见问题

1. **服务无法启动**

   ```bash
   # 检查服务状态
   sudo systemctl status vehicle-backend
   sudo systemctl status vehicle-frontend

   # 查看日志
   sudo journalctl -u vehicle-backend -f
   sudo journalctl -u vehicle-frontend -f
   ```

2. **Docker 服务问题**

   ```bash
   # 查看容器状态
   docker-compose ps

   # 查看日志
   docker-compose logs -f

   # 重新构建镜像
   docker-compose build --no-cache
   ```

3. **Nginx 配置问题**

   ```bash
   # 测试Nginx配置
   sudo nginx -t

   # 重新加载配置
   sudo systemctl reload nginx
   ```

4. **端口冲突**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :5000
   sudo netstat -tlnp | grep :3000
   ```

### 日志位置

- **系统日志**: `/var/log/syslog`
- **Nginx 日志**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **应用日志**: `/opt/vehicle-management/logs/`
- **Docker 日志**: `docker-compose logs`

## 安全建议

1. **更改默认密码**

   - 部署后立即更改默认管理员密码
   - 使用强密码策略

2. **配置 HTTPS**

   - 使用 Let's Encrypt 配置 SSL 证书
   - 配置 HTTPS 重定向

3. **防火墙配置**

   - 只开放必要的端口（80, 443, 22）
   - 使用 fail2ban 防止暴力攻击

4. **定期更新**
   - 定期更新系统和依赖包
   - 监控安全漏洞

## 性能优化

1. **数据库优化**

   - 定期清理日志
   - 优化查询语句

2. **缓存配置**

   - 配置 Redis 缓存
   - 启用 Nginx 缓存

3. **负载均衡**
   - 使用多实例部署
   - 配置负载均衡器

## 监控

建议配置以下监控：

- 系统资源监控（CPU、内存、磁盘）
- 应用性能监控
- 日志监控和告警
- 健康检查监控

## 支持

如果您在部署过程中遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看系统日志和应用日志
3. 联系技术支持团队
