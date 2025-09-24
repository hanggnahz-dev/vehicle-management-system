# Alibaba Cloud Linux 3 部署指南

## 概述

本指南专门针对 Alibaba Cloud Linux 3 系统的阿里云 ECS 部署，提供了完整的云原生部署解决方案，包含阿里云特有的优化和配置。

## Alibaba Cloud Linux 3 特性

### 系统特性

- **基于 CentOS 8** - 继承 CentOS 8 的稳定性和兼容性
- **阿里云优化** - 针对阿里云 ECS 实例进行深度优化
- **长期支持** - 提供长期安全更新和技术支持
- **云原生** - 专为云计算环境设计

### 技术优势

- **性能优化** - 针对阿里云硬件进行性能调优
- **安全增强** - 内置安全防护和漏洞修复
- **云集成** - 深度集成阿里云服务
- **容器友好** - 原生支持 Docker 和 Kubernetes

## 准备工作

### 1. 阿里云资源准备

#### ECS 实例要求

- **操作系统**: Alibaba Cloud Linux 3.0+
- **CPU**: 1 核以上
- **内存**: 2GB 以上
- **存储**: 20GB 以上
- **网络**: 公网 IP 或弹性公网 IP

#### 推荐实例规格

- **开发环境**: ecs.t6-c1m1.large (1 核 2GB)
- **生产环境**: ecs.c6.large (2 核 4GB)
- **高并发**: ecs.c6.xlarge (4 核 8GB)

### 2. 阿里云 Access Key

1. 登录阿里云控制台
2. 进入 RAM 访问控制
3. 创建用户并生成 Access Key
4. 为用户添加以下权限：
   - `AliyunECSFullAccess`
   - `AliyunDNSFullAccess`
   - `AliyunCloudMonitorFullAccess`

## 部署方法

### 方法一：使用 Alibaba Cloud Linux 3 专用脚本（推荐）

```bash
# 下载项目
git clone <your-repo-url>
cd fullstack-project

# 运行 Alibaba Cloud Linux 3 专用部署脚本
chmod +x deploy-aliyun-alinux3.sh
./deploy-aliyun-alinux3.sh
```

### 方法二：使用通用脚本

```bash
# 运行通用部署脚本（自动检测系统）
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh
```

## 部署流程

### 1. 系统检测和优化

- 自动检测 Alibaba Cloud Linux 3 系统
- 配置阿里云镜像源加速
- 安装阿里云优化工具
- 优化系统内核参数

### 2. 依赖安装

- 安装 EPEL 仓库
- 安装基础开发工具
- 安装 Python 开发环境
- 安装 Nginx 和防火墙
- 安装阿里云 CLI 工具

### 3. 运行时环境

- 安装 Node.js 20.x（通过 NodeSource RPM 仓库）
- 安装 Docker 和 Docker Compose
- 配置 Docker 镜像加速器
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

- 配置阿里云 CLI
- 配置安全组规则
- 设置监控和告警

### 7. 系统优化

- 内核参数优化
- 文件描述符优化
- Nginx 性能优化
- 系统服务优化

## Alibaba Cloud Linux 3 特有配置

### 1. 阿里云镜像源配置

#### 自动配置阿里云镜像源

```bash
# 备份原有配置
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

# 配置阿里云镜像源
cat > /etc/yum.repos.d/aliyun.repo << 'EOF'
[aliyun-base]
name=Aliyun Linux - Base
baseurl=https://mirrors.aliyun.com/alinux/3/os/$basearch/
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/alinux/RPM-GPG-KEY-ALINUX
EOF
```

### 2. Docker 镜像加速器

#### 配置阿里云 Docker 镜像加速器

```bash
# 创建 Docker 配置文件
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
    "registry-mirrors": [
        "https://registry.cn-hangzhou.aliyuncs.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com"
    ],
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
EOF

# 重启 Docker 服务
systemctl restart docker
```

### 3. 系统优化配置

#### 内核参数优化

```bash
# 添加内核参数优化
cat >> /etc/sysctl.conf << 'EOF'
# Alibaba Cloud Linux 3 优化参数
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_timestamps = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.ip_local_port_range = 1024 65535
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# 应用内核参数
sysctl -p
```

#### 文件描述符优化

```bash
# 配置文件描述符限制
cat >> /etc/security/limits.conf << 'EOF'
# Alibaba Cloud Linux 3 文件描述符限制
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF
```

### 4. Nginx 性能优化

#### 编辑 /etc/nginx/nginx.conf

```nginx
# Alibaba Cloud Linux 3 Nginx 优化
worker_processes auto;
worker_connections 1024;
worker_rlimit_nofile 65535;

# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 缓存配置
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
```

## 服务管理

### 1. systemd 服务

#### 查看服务状态

```bash
systemctl status vehicle-backend
systemctl status vehicle-frontend
systemctl status nginx
systemctl status firewalld
systemctl status docker
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

### 3. Docker 管理

#### 查看 Docker 状态

```bash
systemctl status docker
docker --version
docker-compose --version
```

#### 查看 Docker 镜像

```bash
docker images
docker ps -a
```

## 故障排除

### 1. 包管理器问题

#### dnf 错误

```bash
# 清理 dnf 缓存
dnf clean all
dnf makecache

# 检查仓库配置
dnf repolist
```

#### 镜像源问题

```bash
# 检查镜像源配置
cat /etc/yum.repos.d/aliyun.repo

# 测试镜像源连接
curl -I https://mirrors.aliyun.com/alinux/3/os/x86_64/
```

### 2. Docker 问题

#### Docker 无法启动

```bash
# 检查 Docker 状态
systemctl status docker

# 查看 Docker 日志
journalctl -u docker -f

# 重新安装 Docker
dnf remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

#### 镜像拉取失败

```bash
# 检查镜像加速器配置
cat /etc/docker/daemon.json

# 重启 Docker 服务
systemctl restart docker

# 测试镜像拉取
docker pull hello-world
```

### 3. 网络问题

#### 防火墙问题

```bash
# 检查防火墙状态
firewall-cmd --state

# 重新启动防火墙
systemctl restart firewalld

# 检查防火墙规则
firewall-cmd --list-all --permanent
```

#### 端口占用

```bash
# 查看端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443
netstat -tlnp | grep :3000
netstat -tlnp | grep :5000

# 杀死占用进程
kill -9 <PID>
```

### 4. 性能问题

#### 系统资源监控

```bash
# 查看系统资源使用
htop
free -h
df -h
iostat -x 1

# 查看网络连接
ss -tuln
```

#### 应用性能监控

```bash
# 查看 Node.js 进程
ps aux | grep node

# 查看 PM2 状态
pm2 status
pm2 logs

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log
```

## 性能优化

### 1. 系统级优化

#### 内核参数调优

```bash
# 查看当前内核参数
sysctl -a | grep net.core
sysctl -a | grep net.ipv4

# 应用优化参数
sysctl -p
```

#### 文件系统优化

```bash
# 查看文件系统信息
df -T
mount | grep ext4

# 优化文件系统挂载选项
# 编辑 /etc/fstab，添加 noatime 选项
```

### 2. 应用级优化

#### Node.js 优化

```bash
# 设置 Node.js 环境变量
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024"

# 使用 PM2 集群模式
pm2 start ecosystem.config.js -i max
```

#### Nginx 优化

```bash
# 启用 Nginx 缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 启用 HTTP/2
listen 443 ssl http2;
```

### 3. 数据库优化

#### SQLite 优化

```bash
# 设置 SQLite 优化参数
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA temp_store=MEMORY;
```

## 安全配置

### 1. 系统安全

#### 更新系统

```bash
# 更新系统包
dnf update -y

# 安装安全更新
dnf update --security -y
```

#### 配置 SSH

```bash
# 编辑 SSH 配置
vim /etc/ssh/sshd_config

# 禁用 root 登录
PermitRootLogin no

# 禁用密码认证
PasswordAuthentication no

# 重启 SSH 服务
systemctl restart sshd
```

### 2. 应用安全

#### 配置防火墙

```bash
# 只允许必要的端口
firewall-cmd --permanent --remove-service=ssh
firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='YOUR_IP' port protocol='tcp' port='22' accept"
firewall-cmd --reload
```

#### 配置 SSL

```bash
# 强制 HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 监控和维护

### 1. 系统监控

#### 安装监控工具

```bash
# 安装系统监控工具
dnf install -y htop iotop nethogs

# 安装阿里云监控代理
wget https://cms-agent-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/release/cms_go_agent/cms_go_agent-1.0.0-linux-amd64.tar.gz
tar -xzf cms_go_agent-1.0.0-linux-amd64.tar.gz
cd cms_go_agent-1.0.0-linux-amd64
./install.sh
```

#### 配置监控告警

```bash
# 创建监控脚本
cat > /opt/monitor.sh << 'EOF'
#!/bin/bash
# 检查服务状态
if ! systemctl is-active --quiet vehicle-backend; then
    echo "Backend service is down" | mail -s "Service Alert" admin@example.com
fi

if ! systemctl is-active --quiet vehicle-frontend; then
    echo "Frontend service is down" | mail -s "Service Alert" admin@example.com
fi
EOF

chmod +x /opt/monitor.sh

# 添加到 crontab
echo "*/5 * * * * /opt/monitor.sh" | crontab -
```

### 2. 日志管理

#### 配置日志轮转

```bash
# 创建日志轮转配置
cat > /etc/logrotate.d/vehicle-management << 'EOF'
/opt/vehicle-management/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload vehicle-backend vehicle-frontend
    endscript
}
EOF
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

# 备份数据库
cp /opt/vehicle-management/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/vehicle-management/.env

# 清理旧备份
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-db.sh

# 添加到 crontab
echo "0 2 * * * /opt/backup-db.sh" | crontab -
```

## 总结

Alibaba Cloud Linux 3 部署脚本为车辆管理系统提供了完整的云原生部署解决方案，特别适合：

- 阿里云 ECS 实例
- 企业级生产环境
- 高可用性要求
- 性能优化需求
- 安全合规要求

通过本指南，您可以在 Alibaba Cloud Linux 3 系统上成功部署车辆管理系统，享受完整的云原生部署体验和阿里云特有的优化。

## 支持

如遇到问题，请检查：

1. 阿里云控制台：检查实例和安全组状态
2. 系统日志：`journalctl -u vehicle-backend -f`
3. 服务状态：`systemctl status vehicle-backend`
4. 网络连接：`curl http://localhost:5000/health`
5. 防火墙状态：`firewall-cmd --list-all`
6. Docker 状态：`systemctl status docker`
7. 阿里云监控：检查云监控控制台
