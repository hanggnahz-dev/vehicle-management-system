# CentOS 系列部署指南

## 概述

本指南专门针对 CentOS 系列系统（CentOS、RHEL、Rocky Linux、AlmaLinux、Alibaba Cloud Linux）的阿里云 ECS 部署，提供了完整的云原生部署解决方案。

## 支持的 CentOS 系列系统

### 官方支持

- **CentOS 7/8/9** - 社区企业操作系统
- **Red Hat Enterprise Linux (RHEL)** - 红帽企业 Linux
- **Rocky Linux** - CentOS 的社区替代品
- **AlmaLinux** - 另一个 CentOS 替代品
- **Alibaba Cloud Linux** - 阿里云定制 Linux

### 包管理器支持

- **yum** - CentOS 7 及更早版本
- **dnf** - CentOS 8+、Rocky Linux、AlmaLinux

## 准备工作

### 1. 阿里云资源准备

#### ECS 实例要求

- **操作系统**: CentOS 7.0+ / RHEL 7.0+ / Rocky Linux 8.0+ / AlmaLinux 8.0+ / Alibaba Cloud Linux 2.0+
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

## 部署方法

### 方法一：使用 CentOS 专用脚本（推荐）

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行 CentOS 专用部署脚本
chmod +x deploy-aliyun-centos.sh
./deploy-aliyun-centos.sh
```

### 方法二：使用通用脚本

```bash
# 运行通用部署脚本（自动检测系统）
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh
```

## 部署流程

### 1. 系统检测

- 自动检测 CentOS 系列系统
- 识别包管理器（yum/dnf）
- 验证系统版本兼容性

### 2. 依赖安装

- 安装 EPEL 仓库
- 安装基础开发工具
- 安装 Python 开发环境
- 安装 Nginx 和防火墙

### 3. 运行时环境

- 安装 Node.js 20.x（通过 NodeSource RPM 仓库）
- 安装 Docker 和 Docker Compose
- 安装 PM2 进程管理器

### 4. 项目部署

- 部署项目文件
- 安装项目依赖
- 构建前端项目
- 配置环境变量

### 5. 服务配置

- 创建 systemd 服务文件
- 配置 Nginx 反向代理
- 申请 SSL 证书
- 配置防火墙规则

### 6. 阿里云集成

- 安装阿里云 CLI
- 配置安全组规则
- 设置监控和告警

## CentOS 系列特有配置

### 1. 包管理器配置

#### CentOS 7 及更早版本

```bash
# 使用 yum 包管理器
yum update -y
yum install -y epel-release
yum install -y nginx firewalld certbot
```

#### CentOS 8+ / Rocky Linux / AlmaLinux

```bash
# 使用 dnf 包管理器
dnf update -y
dnf install -y epel-release
dnf install -y nginx firewalld certbot
```

### 2. 防火墙配置

#### firewalld 配置

```bash
# 启动并启用 firewalld
systemctl start firewalld
systemctl enable firewalld

# 配置防火墙规则
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --permanent --add-port=5000/tcp

# 重新加载规则
firewall-cmd --reload

# 查看防火墙状态
firewall-cmd --list-all
```

### 3. Nginx 配置

#### CentOS 系列 Nginx 配置

```bash
# 配置文件位置
/etc/nginx/conf.d/vehicle-management.conf

# 确保 nginx.conf 包含 conf.d 目录
include /etc/nginx/conf.d/*.conf;

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

### 4. Node.js 安装

#### 通过 NodeSource RPM 仓库

```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -

# 安装 Node.js
yum install -y nodejs  # CentOS 7
dnf install -y nodejs  # CentOS 8+
```

## 服务管理

### 1. systemd 服务

#### 查看服务状态

```bash
systemctl status vehicle-backend
systemctl status vehicle-frontend
systemctl status nginx
systemctl status firewalld
```

#### 启动/停止/重启服务

```bash
# 启动服务
systemctl start vehicle-backend
systemctl start vehicle-frontend

# 停止服务
systemctl stop vehicle-backend
systemctl stop vehicle-frontend

# 重启服务
systemctl restart vehicle-backend
systemctl restart vehicle-frontend

# 启用开机自启
systemctl enable vehicle-backend
systemctl enable vehicle-frontend
```

#### 查看服务日志

```bash
journalctl -u vehicle-backend -f
journalctl -u vehicle-frontend -f
journalctl -u nginx -f
```

### 2. 防火墙管理

#### 查看防火墙状态

```bash
firewall-cmd --state
firewall-cmd --list-all
```

#### 添加/删除规则

```bash
# 添加端口
firewall-cmd --permanent --add-port=8080/tcp

# 删除端口
firewall-cmd --permanent --remove-port=8080/tcp

# 重新加载
firewall-cmd --reload
```

## 故障排除

### 1. 包管理器问题

#### yum 错误

```bash
# 清理 yum 缓存
yum clean all
yum makecache

# 检查仓库配置
yum repolist
```

#### dnf 错误

```bash
# 清理 dnf 缓存
dnf clean all
dnf makecache

# 检查仓库配置
dnf repolist
```

### 2. 防火墙问题

#### firewalld 无法启动

```bash
# 检查 firewalld 状态
systemctl status firewalld

# 重新安装 firewalld
yum reinstall firewalld
# 或
dnf reinstall firewalld

# 启动服务
systemctl start firewalld
```

#### 防火墙规则不生效

```bash
# 检查规则是否永久保存
firewall-cmd --list-all --permanent

# 重新加载规则
firewall-cmd --reload

# 重启 firewalld
systemctl restart firewalld
```

### 3. Nginx 问题

#### Nginx 配置错误

```bash
# 测试配置文件
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 重新加载配置
systemctl reload nginx
```

#### 端口占用

```bash
# 查看端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# 杀死占用进程
kill -9 <PID>
```

### 4. Node.js 问题

#### Node.js 版本问题

```bash
# 检查 Node.js 版本
node --version
npm --version

# 重新安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
# 或
dnf install -y nodejs
```

#### npm 权限问题

```bash
# 修复 npm 权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# 或使用 sudo
sudo npm install -g pm2
```

## 性能优化

### 1. 系统优化

#### 内核参数优化

```bash
# 编辑 /etc/sysctl.conf
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65535" >> /etc/sysctl.conf

# 应用配置
sysctl -p
```

#### 文件描述符限制

```bash
# 编辑 /etc/security/limits.conf
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
```

### 2. Nginx 优化

#### 编辑 /etc/nginx/nginx.conf

```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# 缓存配置
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Node.js 优化

#### 设置环境变量

```bash
# 编辑 /etc/systemd/system/vehicle-backend.service
Environment=NODE_ENV=production
Environment=NODE_OPTIONS="--max-old-space-size=1024"
```

## 安全配置

### 1. SELinux 配置

#### 检查 SELinux 状态

```bash
sestatus
getenforce
```

#### 配置 SELinux

```bash
# 临时禁用 SELinux
setenforce 0

# 永久禁用 SELinux（需要重启）
sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
```

### 2. 系统更新

#### 定期更新系统

```bash
# CentOS 7
yum update -y

# CentOS 8+
dnf update -y

# 重启系统
reboot
```

### 3. 安全加固

#### 配置 SSH

```bash
# 编辑 /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# 重启 SSH 服务
systemctl restart sshd
```

## 监控和维护

### 1. 系统监控

#### 安装监控工具

```bash
# 安装 htop
yum install -y htop
# 或
dnf install -y htop

# 安装 iotop
yum install -y iotop
# 或
dnf install -y iotop
```

#### 查看系统资源

```bash
# CPU 使用率
top
htop

# 内存使用
free -h

# 磁盘使用
df -h

# 网络连接
netstat -tlnp
```

### 2. 日志管理

#### 配置日志轮转

```bash
# 编辑 /etc/logrotate.d/vehicle-management
/opt/vehicle-management/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 3. 备份策略

#### 数据库备份

```bash
# 创建备份脚本
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /opt/vehicle-management/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete
EOF

chmod +x /opt/backup-db.sh

# 添加到 crontab
echo "0 2 * * * /opt/backup-db.sh" | crontab -
```

## 总结

CentOS 系列部署脚本为车辆管理系统提供了完整的云原生部署解决方案，特别适合：

- 企业级 CentOS 环境
- 红帽生态系统
- 阿里云 ECS 实例
- 高安全要求环境
- 长期稳定运行需求

通过本指南，您可以在 CentOS 系列系统上成功部署车辆管理系统，享受完整的云原生部署体验。

## 支持

如遇到问题，请检查：

1. 阿里云控制台：检查实例和安全组状态
2. 系统日志：`journalctl -u vehicle-backend -f`
3. 服务状态：`systemctl status vehicle-backend`
4. 网络连接：`curl http://localhost:5000/health`
5. 防火墙状态：`firewall-cmd --list-all`
