# Root 用户部署指南

## 概述

本指南专门为使用 root 用户部署车辆管理系统而编写。Root 用户部署脚本已经过优化，无需 sudo 权限，部署过程更加简洁高效。

## 快速开始

### 1. 下载项目

```bash
git clone <your-repo-url>
cd fullstack-project
```

### 2. 运行 Root 部署脚本

```bash
chmod +x deploy-ubuntu-root.sh
./deploy-ubuntu-root.sh
```

## 部署脚本特点

### Root 用户优化

- ✅ 无需 sudo 权限
- ✅ 直接使用 root 权限执行所有操作
- ✅ 自动检测 root 用户身份
- ✅ 优化的权限管理

### 自动安装组件

- ✅ Node.js 20.x
- ✅ Docker & Docker Compose
- ✅ PM2 进程管理器
- ✅ Nginx 反向代理
- ✅ UFW 防火墙配置

### 服务配置

- ✅ Systemd 服务自动配置
- ✅ 自动启动和开机自启
- ✅ 健康检查和监控
- ✅ 日志管理

## 部署后访问

部署完成后，您可以通过以下地址访问系统：

- **前端界面**: `http://服务器IP地址`
- **后端 API**: `http://服务器IP地址/api`
- **健康检查**: `http://服务器IP地址/health`

## 默认账户

- **邮箱**: admin@example.com
- **密码**: admin123

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

## 项目目录结构

```
/opt/vehicle-management/
├── backend/          # 后端代码
├── frontend/         # 前端代码
├── data/            # 数据库文件
├── .env             # 环境变量
└── *.sh            # 部署脚本
```

## 防火墙配置

脚本会自动配置 UFW 防火墙，开放以下端口：

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

## 故障排除

### 1. 服务启动失败

```bash
# 查看详细错误信息
systemctl status vehicle-backend
journalctl -u vehicle-backend -n 50
```

### 2. 端口冲突

```bash
# 检查端口占用
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000
```

### 3. 权限问题

```bash
# 检查文件权限
ls -la /opt/vehicle-management/
```

### 4. 数据库问题

```bash
# 检查数据库文件
ls -la /opt/vehicle-management/data/
```

## 安全建议

1. **修改默认密码**: 部署后请立即修改默认管理员密码
2. **配置 HTTPS**: 生产环境建议配置 SSL 证书
3. **定期备份**: 定期备份数据库文件
4. **监控日志**: 定期检查系统日志

## 支持

如遇到问题，请检查：

1. 系统日志: `journalctl -u vehicle-backend -f`
2. 服务状态: `systemctl status vehicle-backend`
3. 网络连接: `curl http://localhost:5000/health`

## 更新部署

如需更新系统，请：

1. 停止服务
2. 更新代码
3. 重新构建前端
4. 重启服务

```bash
systemctl stop vehicle-backend vehicle-frontend
git pull
cd frontend && npm run build && cd ..
systemctl start vehicle-backend vehicle-frontend
```
