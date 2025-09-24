# 部署指南

本文档详细说明了如何部署 Fullstack 应用到生产环境。

## 部署方式

### 1. Docker Compose 部署（推荐）

这是最简单和推荐的部署方式。

#### 准备工作

1. **服务器要求**

   - Ubuntu 20.04+ 或 CentOS 8+
   - 至少 2GB RAM
   - 至少 20GB 磁盘空间
   - 公网 IP 和域名

2. **安装 Docker 和 Docker Compose**

   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

#### 部署步骤

1. **克隆代码**

   ```bash
   git clone <repository-url>
   cd fullstack-project
   ```

2. **配置环境变量**

   ```bash
   # 复制环境变量文件
   cp backend/env.example backend/.env

   # 编辑环境变量
   nano backend/.env
   ```

3. **启动服务**

   ```bash
   # 使用启动脚本
   ./docker/start.sh

   # 或手动启动
   docker-compose up --build -d
   ```

4. **验证部署**

   ```bash
   # 检查服务状态
   docker-compose ps

   # 查看日志
   docker-compose logs -f
   ```

### 2. 手动部署

#### 服务器环境准备

1. **安装 Node.js**

   ```bash
   # 使用 NodeSource 仓库
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **安装 MySQL**

   ```bash
   sudo apt update
   sudo apt install mysql-server

   # 配置 MySQL
   sudo mysql_secure_installation
   ```

3. **安装 Nginx**

   ```bash
   sudo apt install nginx
   ```

4. **安装 PM2**
   ```bash
   sudo npm install -g pm2
   ```

#### 部署后端

1. **构建后端**

   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **配置环境变量**

   ```bash
   cp env.example .env
   nano .env
   ```

3. **启动服务**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

#### 部署前端

1. **构建前端**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **配置 Nginx**
   ```bash
   sudo cp nginx/nginx.conf /etc/nginx/sites-available/fullstack
   sudo ln -s /etc/nginx/sites-available/fullstack /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 生产环境配置

### 1. 安全配置

#### 防火墙设置

```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### SSL 证书配置

```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### 环境变量安全

```bash
# 生成强密码
openssl rand -base64 32

# 设置强 JWT 密钥
JWT_SECRET=$(openssl rand -base64 64)
```

### 2. 数据库配置

#### MySQL 优化

```sql
-- 编辑 /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

#### 数据库备份

```bash
# 创建备份脚本
cat > /home/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p fullstack_db > /backup/fullstack_$DATE.sql
find /backup -name "fullstack_*.sql" -mtime +7 -delete
EOF

chmod +x /home/backup.sh

# 设置定时备份
crontab -e
# 添加：0 2 * * * /home/backup.sh
```

### 3. 监控配置

#### 系统监控

```bash
# 安装监控工具
sudo apt install htop iotop nethogs

# 监控脚本
cat > /home/monitor.sh << 'EOF'
#!/bin/bash
echo "=== 系统状态 ==="
echo "CPU 使用率: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "内存使用率: $(free | grep Mem | awk '{printf("%.2f%%", $3/$2 * 100.0)}')"
echo "磁盘使用率: $(df -h / | awk 'NR==2{print $5}')"
echo "=== 服务状态 ==="
docker-compose ps
pm2 status
EOF

chmod +x /home/monitor.sh
```

#### 日志管理

```bash
# 配置日志轮转
sudo nano /etc/logrotate.d/fullstack

# 内容：
/var/log/fullstack/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

## 性能优化

### 1. 前端优化

#### 构建优化

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          element: ["element-plus"],
        },
      },
    },
  },
});
```

#### 缓存策略

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 后端优化

#### 数据库连接池

```javascript
// config/database.ts
const dbConfig = {
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};
```

#### 缓存配置

```javascript
// 使用 Redis 缓存
const redis = require("redis");
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});
```

### 3. 服务器优化

#### 系统参数调优

```bash
# 编辑 /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 10
```

## 故障排除

### 常见问题

1. **服务无法启动**

   ```bash
   # 检查端口占用
   netstat -tulpn | grep :80

   # 检查日志
   docker-compose logs backend
   pm2 logs
   ```

2. **数据库连接失败**

   ```bash
   # 检查 MySQL 状态
   sudo systemctl status mysql

   # 测试连接
   mysql -u root -p -h localhost
   ```

3. **前端页面无法访问**

   ```bash
   # 检查 Nginx 状态
   sudo systemctl status nginx

   # 检查配置
   sudo nginx -t
   ```

### 日志分析

```bash
# 查看错误日志
tail -f /var/log/nginx/error.log
tail -f /var/log/mysql/error.log

# 分析访问日志
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

## 备份与恢复

### 数据备份

```bash
# 完整备份脚本
cat > /home/full_backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/$DATE"

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u root -p fullstack_db > $BACKUP_DIR/database.sql

# 备份应用文件
tar -czf $BACKUP_DIR/app.tar.gz /var/www/fullstack

# 备份配置文件
cp -r /etc/nginx/sites-available/fullstack $BACKUP_DIR/
cp /etc/systemd/system/fullstack.service $BACKUP_DIR/

# 清理旧备份
find /backup -type d -mtime +30 -exec rm -rf {} \;
EOF

chmod +x /home/full_backup.sh
```

### 数据恢复

```bash
# 恢复数据库
mysql -u root -p fullstack_db < /backup/20240101_120000/database.sql

# 恢复应用文件
tar -xzf /backup/20240101_120000/app.tar.gz -C /

# 重启服务
systemctl restart nginx
pm2 restart all
```

## 更新部署

### 零停机更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建新版本
docker-compose build

# 3. 滚动更新
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend

# 4. 验证更新
curl -f http://localhost/health || exit 1
```

### 回滚策略

```bash
# 回滚到上一个版本
docker-compose down
git checkout HEAD~1
docker-compose up -d
```

## 监控告警

### 设置告警

```bash
# 安装监控工具
sudo apt install mailutils

# 创建告警脚本
cat > /home/alert.sh << 'EOF'
#!/bin/bash
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "服务异常，请检查！" | mail -s "服务告警" admin@example.com
fi
EOF

chmod +x /home/alert.sh

# 设置定时检查
crontab -e
# 添加：*/5 * * * * /home/alert.sh
```

通过以上配置，您可以成功部署一个高可用、高性能的全栈应用。
