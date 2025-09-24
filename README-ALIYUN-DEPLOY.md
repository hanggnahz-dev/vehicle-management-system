# 阿里云 ECS 部署指南

## 概述

本指南详细说明如何在阿里云 ECS 上部署车辆管理系统，包括自动配置安全组、SSL 证书、域名解析等功能。

## 准备工作

### 1. 阿里云资源准备

#### ECS 实例要求

- **操作系统**: Ubuntu 18.04+ / CentOS 7+ / Alibaba Cloud Linux 2.0+
- **CPU**: 1 核以上
- **内存**: 2GB 以上
- **存储**: 20GB 以上
- **网络**: 公网 IP 或弹性公网 IP

#### 域名准备（可选）

- 已备案的域名
- 域名解析权限

### 2. 阿里云 Access Key

1. 登录阿里云控制台
2. 进入 RAM 访问控制
3. 创建用户并生成 Access Key
4. 为用户添加以下权限：
   - `AliyunECSFullAccess`
   - `AliyunDNSFullAccess`

## 部署步骤

### 1. 连接 ECS 实例

```bash
# 使用SSH连接ECS实例
ssh root@your-ecs-ip
```

### 2. 下载项目

```bash
# 下载项目文件
git clone <your-repo-url>
cd fullstack-project

# 或者上传项目文件到服务器
```

### 3. 运行部署脚本

```bash
# 给脚本执行权限
chmod +x deploy-aliyun.sh

# 运行部署脚本
./deploy-aliyun.sh
```

### 4. 按提示输入配置信息

脚本会提示输入以下信息：

- **域名** (可选): 如果使用域名访问
- **邮箱**: 用于 SSL 证书申请
- **阿里云 Access Key ID**: 用于配置安全组
- **阿里云 Access Key Secret**: 用于配置安全组
- **地域**: 阿里云地域，默认 cn-hangzhou

## 部署功能

### 自动安装组件

- ✅ Node.js 20.x
- ✅ Docker & Docker Compose
- ✅ PM2 进程管理器
- ✅ Nginx 反向代理
- ✅ Certbot SSL 证书工具
- ✅ 阿里云 CLI 工具

### 自动配置服务

- ✅ Systemd 服务自动配置
- ✅ 自动启动和开机自启
- ✅ 健康检查和监控
- ✅ 日志管理

### 自动配置网络

- ✅ 防火墙规则配置
- ✅ 阿里云安全组自动配置
- ✅ SSL 证书自动申请和配置
- ✅ 域名解析配置（需要手动）

## 访问系统

### 使用 IP 访问

```
http://your-ecs-ip
```

### 使用域名访问

```
https://your-domain.com
```

## 服务管理

### 查看服务状态

```bash
systemctl status vehicle-backend
systemctl status vehicle-frontend
```

### 重启服务

```bash
systemctl restart vehicle-backend
systemctl restart vehicle-frontend
```

### 查看日志

```bash
journalctl -u vehicle-backend -f
journalctl -u vehicle-frontend -f
```

### 停止服务

```bash
systemctl stop vehicle-backend
systemctl stop vehicle-frontend
```

## 域名配置

### 1. 域名解析

在域名管理控制台添加 A 记录：

- **记录类型**: A
- **主机记录**: @ (或 www)
- **记录值**: ECS 公网 IP
- **TTL**: 600

### 2. SSL 证书

脚本会自动申请 Let's Encrypt 免费 SSL 证书：

- 证书有效期：90 天
- 自动续期：已配置 crontab 任务
- 证书路径：`/etc/letsencrypt/live/your-domain.com/`

## 安全配置

### 防火墙规则

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

### 阿里云安全组

脚本会自动配置安全组规则：

- 开放 80 端口（HTTP）
- 开放 443 端口（HTTPS）

## 监控和维护

### 1. 服务监控

```bash
# 查看所有服务状态
systemctl status vehicle-backend vehicle-frontend nginx

# 查看系统资源使用
htop
df -h
free -h
```

### 2. 日志查看

```bash
# 查看应用日志
journalctl -u vehicle-backend -f
journalctl -u vehicle-frontend -f

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. 备份数据

```bash
# 备份数据库
cp /opt/vehicle-management/data/database.sqlite /backup/database-$(date +%Y%m%d).sqlite

# 备份配置文件
tar -czf /backup/config-$(date +%Y%m%d).tar.gz /opt/vehicle-management/.env
```

## 故障排除

### 1. 服务启动失败

```bash
# 查看详细错误信息
systemctl status vehicle-backend
journalctl -u vehicle-backend -n 50

# 检查端口占用
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000
```

### 2. 域名无法访问

```bash
# 检查域名解析
nslookup your-domain.com

# 检查Nginx配置
nginx -t

# 检查SSL证书
certbot certificates
```

### 3. 数据库问题

```bash
# 检查数据库文件
ls -la /opt/vehicle-management/data/

# 检查数据库权限
ls -la /opt/vehicle-management/data/database.sqlite
```

### 4. 阿里云安全组问题

```bash
# 检查安全组规则
aliyun ecs DescribeSecurityGroupAttribute --SecurityGroupId sg-xxx

# 手动添加安全组规则
aliyun ecs AuthorizeSecurityGroup \
    --SecurityGroupId sg-xxx \
    --IpProtocol tcp \
    --PortRange 80/80 \
    --SourceCidrIp 0.0.0.0/0
```

## 性能优化

### 1. Nginx 优化

编辑 `/etc/nginx/nginx.conf`：

```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Node.js 优化

设置环境变量：

```bash
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"
```

### 3. 数据库优化

定期清理日志：

```bash
# 清理系统日志
journalctl --vacuum-time=7d

# 清理Nginx日志
find /var/log/nginx -name "*.log" -mtime +7 -delete
```

## 更新部署

### 1. 更新代码

```bash
cd /opt/vehicle-management
git pull

# 重新构建前端
cd frontend
npm run build
cd ..

# 重启服务
systemctl restart vehicle-backend vehicle-frontend
```

### 2. 更新依赖

```bash
cd /opt/vehicle-management

# 更新后端依赖
cd backend
npm update
cd ..

# 更新前端依赖
cd frontend
npm update
npm run build
cd ..

# 重启服务
systemctl restart vehicle-backend vehicle-frontend
```

## 成本优化

### 1. 实例规格选择

- 开发环境：1 核 2GB
- 生产环境：2 核 4GB
- 高并发：4 核 8GB

### 2. 存储优化

- 系统盘：40GB SSD
- 数据盘：根据需求选择

### 3. 网络优化

- 使用弹性公网 IP
- 配置 CDN 加速

## 安全建议

1. **定期更新系统**

   ```bash
   apt update && apt upgrade -y
   ```

2. **修改默认密码**

   - 部署后立即修改默认管理员密码
   - 使用强密码策略

3. **配置 HTTPS**

   - 生产环境必须使用 HTTPS
   - 定期检查 SSL 证书有效期

4. **定期备份**

   - 数据库定期备份
   - 配置文件备份
   - 代码版本控制

5. **监控告警**
   - 配置云监控
   - 设置告警规则
   - 监控服务状态

## 支持

如遇到问题，请检查：

1. 系统日志：`journalctl -u vehicle-backend -f`
2. 服务状态：`systemctl status vehicle-backend`
3. 网络连接：`curl http://localhost:5000/health`
4. 阿里云控制台：检查安全组和实例状态
