#!/bin/bash

# 阿里云ECS Alibaba Cloud Linux 3专用部署脚本 - 车辆管理系统
# 作者: AI Assistant
# 版本: 1.0
# 用途: 在阿里云ECS Alibaba Cloud Linux 3上自动部署车辆管理系统

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
PROJECT_NAME="vehicle-management"
PROJECT_DIR="/opt/${PROJECT_NAME}"
DOMAIN_NAME=""
EMAIL=""
ALIYUN_ACCESS_KEY=""
ALIYUN_SECRET_KEY=""
REGION="cn-hangzhou"

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要使用root用户运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
    log_success "检测到root用户，开始部署..."
}

# 检查Alibaba Cloud Linux 3系统
check_alinux3_system() {
    log_info "检查Alibaba Cloud Linux 3系统..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        ID=$ID
    else
        log_error "无法确定操作系统版本"
        exit 1
    fi
    
    # 检查是否为Alibaba Cloud Linux 3
    if [[ "$ID" == "alinux" ]] && [[ "$VER" == "3" ]]; then
        log_success "检测到Alibaba Cloud Linux 3: $OS $VER"
        
        # 检查包管理器
        if command -v dnf &> /dev/null; then
            PACKAGE_MANAGER="dnf"
            log_info "使用dnf包管理器"
        elif command -v yum &> /dev/null; then
            PACKAGE_MANAGER="yum"
            log_info "使用yum包管理器"
        else
            log_error "未找到支持的包管理器"
            exit 1
        fi
    else
        log_error "此脚本仅支持Alibaba Cloud Linux 3"
        log_info "检测到的系统: $OS $VER"
        log_info "请使用通用部署脚本: ./deploy-aliyun.sh"
        exit 1
    fi
}

# 获取用户配置
get_user_config() {
    log_info "获取部署配置..."
    
    # 获取域名
    if [[ -z "$DOMAIN_NAME" ]]; then
        read -p "请输入域名 (可选，直接回车跳过): " DOMAIN_NAME
    fi
    
    # 获取邮箱
    if [[ -z "$EMAIL" ]]; then
        read -p "请输入邮箱地址 (用于SSL证书): " EMAIL
    fi
    
    # 获取阿里云Access Key
    if [[ -z "$ALIYUN_ACCESS_KEY" ]]; then
        read -p "请输入阿里云Access Key ID: " ALIYUN_ACCESS_KEY
    fi
    
    # 获取阿里云Secret Key
    if [[ -z "$ALIYUN_SECRET_KEY" ]]; then
        read -s -p "请输入阿里云Access Key Secret: " ALIYUN_SECRET_KEY
        echo
    fi
    
    # 获取地域
    if [[ -z "$REGION" ]]; then
        read -p "请输入阿里云地域 (默认: cn-hangzhou): " REGION
        REGION=${REGION:-cn-hangzhou}
    fi
}

# 优化Alibaba Cloud Linux 3系统
optimize_alinux3_system() {
    log_info "优化Alibaba Cloud Linux 3系统..."
    
    # 询问是否配置镜像源
    read -p "是否配置阿里云镜像源加速？(y/n，默认y): " CONFIGURE_MIRROR
    CONFIGURE_MIRROR=${CONFIGURE_MIRROR:-y}
    
    # 更新系统
    $PACKAGE_MANAGER update -y
    
    # 安装阿里云优化工具
    # 注意：aliyun-assistant 在某些版本中可能不可用，跳过安装
    # $PACKAGE_MANAGER install -y aliyun-assistant
    
    # 配置阿里云镜像源
    if [[ "$CONFIGURE_MIRROR" == "y" || "$CONFIGURE_MIRROR" == "Y" ]]; then
        log_info "配置阿里云镜像源..."
        
        if [[ -f /etc/yum.repos.d/CentOS-Base.repo ]]; then
            mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
        fi
    
    # 使用阿里云镜像源
    cat > /etc/yum.repos.d/aliyun.repo << 'EOF'
[aliyun-base]
name=Aliyun Linux - Base
baseurl=https://mirrors.aliyun.com/alinux/3/os/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1

[aliyun-updates]
name=Aliyun Linux - Updates
baseurl=https://mirrors.aliyun.com/alinux/3/updates/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1

[aliyun-extras]
name=Aliyun Linux - Extras
baseurl=https://mirrors.aliyun.com/alinux/3/extras/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1

[aliyun-plus]
name=Aliyun Linux - Plus
baseurl=https://mirrors.aliyun.com/alinux/3/plus/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1
EOF
    
    # 清理缓存并重新生成
    $PACKAGE_MANAGER clean all
    
    # 尝试生成缓存，如果失败则使用备用方案
    if ! $PACKAGE_MANAGER makecache; then
        log_warning "阿里云镜像源缓存生成失败，尝试备用方案..."
        
        # 使用官方镜像源作为备用
        cat > /etc/yum.repos.d/aliyun-backup.repo << 'EOF'
[alinux-base]
name=Alibaba Cloud Linux - Base
baseurl=https://mirrors.cloud.aliyuncs.com/alinux/3/os/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1

[alinux-updates]
name=Alibaba Cloud Linux - Updates
baseurl=https://mirrors.cloud.aliyuncs.com/alinux/3/updates/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1

[alinux-extras]
name=Alibaba Cloud Linux - Extras
baseurl=https://mirrors.cloud.aliyuncs.com/alinux/3/extras/$basearch/
enabled=1
gpgcheck=0
skip_if_unavailable=1
EOF
        
        # 再次尝试生成缓存
        if ! $PACKAGE_MANAGER makecache; then
            log_warning "备用镜像源也失败，将使用系统默认源"
            # 恢复原始配置
            if [[ -f /etc/yum.repos.d/CentOS-Base.repo.backup ]]; then
                mv /etc/yum.repos.d/CentOS-Base.repo.backup /etc/yum.repos.d/CentOS-Base.repo
            fi
            rm -f /etc/yum.repos.d/aliyun.repo /etc/yum.repos.d/aliyun-backup.repo
        else
            log_success "备用镜像源配置成功"
        fi
    else
        log_success "阿里云镜像源配置成功"
    fi
    else
        log_info "跳过镜像源配置，使用系统默认源"
    fi
    
    log_success "Alibaba Cloud Linux 3系统优化完成"
}

# 安装系统依赖
install_dependencies() {
    log_info "安装Alibaba Cloud Linux 3系统依赖..."
    
    # 安装EPEL仓库
    $PACKAGE_MANAGER install -y epel-release
    
    # 安装基础依赖
    $PACKAGE_MANAGER install -y \
        curl \
        wget \
        git \
        unzip \
        gcc \
        gcc-c++ \
        make \
        openssl-devel \
        nginx \
        firewalld \
        certbot \
        python3-certbot-nginx \
        python3-pip \
        python3-devel \
        libffi-devel \
        openssl-devel \
        bzip2-devel \
        readline-devel \
        sqlite-devel \
        tk-devel \
        libuuid-devel \
        xz-devel \
        zlib-devel \
        policycoreutils-python-utils \
        selinux-policy-devel \
        cloud-init \
        cloud-utils-growpart
    
    # 启动并启用firewalld
    systemctl start firewalld
    systemctl enable firewalld
    
    # 启动并启用cloud-init
    systemctl start cloud-init
    systemctl enable cloud-init
    
    log_success "Alibaba Cloud Linux 3系统依赖安装完成"
}

# 安装Node.js
install_nodejs() {
    log_info "安装Node.js..."
    
    # 检查Node.js是否已安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_warning "Node.js已安装: $NODE_VERSION"
        
        # 检查版本是否满足要求 (>= 18.0.0)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [[ $NODE_MAJOR -ge 18 ]]; then
            log_success "Node.js版本满足要求"
            return
        else
            log_warning "Node.js版本过低，需要升级"
        fi
    fi
    
    # 添加NodeSource仓库
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    
    # 安装Node.js
    $PACKAGE_MANAGER install -y nodejs
    
    # 验证安装
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js安装完成: $NODE_VERSION, npm: $NPM_VERSION"
}

# 安装Docker
install_docker() {
    log_info "安装Docker..."
    
    # 检查Docker是否已安装
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_warning "Docker已安装: $DOCKER_VERSION"
        return
    fi
    
    # 安装Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # 启动Docker服务
    systemctl start docker
    systemctl enable docker
    
    # 配置Docker使用阿里云镜像加速器
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
    
    # 重启Docker服务
    systemctl restart docker
    
    log_success "Docker安装完成"
}

# 安装Docker Compose
install_docker_compose() {
    log_info "安装Docker Compose..."
    
    # 检查Docker Compose是否已安装
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_warning "Docker Compose已安装: $COMPOSE_VERSION"
        return
    fi
    
    # 安装Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose安装完成"
}

# 安装PM2
install_pm2() {
    log_info "安装PM2..."
    
    # 检查PM2是否已安装
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        log_warning "PM2已安装: $PM2_VERSION"
        return
    fi
    
    # 全局安装PM2
    npm install -g pm2
    
    log_success "PM2安装完成"
}

# 创建项目目录
create_project_directory() {
    log_info "创建项目目录..."
    
    # 创建目录
    mkdir -p $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 部署项目文件
deploy_project() {
    log_info "部署项目文件..."
    
    # 复制项目文件
    cp -r . $PROJECT_DIR/
    cd $PROJECT_DIR
    
    # 设置文件权限
    chmod +x *.sh
    
    log_success "项目文件部署完成"
}

# 安装项目依赖
install_project_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装后端依赖
    cd backend
    npm install
    cd ..
    
    # 安装前端依赖
    cd frontend
    npm install
    cd ..
    
    log_success "项目依赖安装完成"
}

# 构建前端项目
build_frontend() {
    log_info "构建前端项目..."
    
    cd frontend
    npm run build
    cd ..
    
    log_success "前端项目构建完成"
}

# 配置环境变量
configure_environment() {
    log_info "配置环境变量..."
    
    # 创建环境变量文件
    cat > $PROJECT_DIR/.env << EOF
# 环境配置
NODE_ENV=production
PORT=5000

# 数据库配置
DB_PATH=$PROJECT_DIR/data/database.sqlite

# JWT配置
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# 前端配置
VITE_API_BASE_URL=http://localhost:5000/api

# 阿里云配置
ALIYUN_ACCESS_KEY=$ALIYUN_ACCESS_KEY
ALIYUN_SECRET_KEY=$ALIYUN_SECRET_KEY
ALIYUN_REGION=$REGION

# Alibaba Cloud Linux 3优化配置
ALINUX3_OPTIMIZED=true
EOF
    
    log_success "环境变量配置完成"
}

# 创建systemd服务文件
create_systemd_service() {
    log_info "创建systemd服务..."
    
    # 创建后端服务文件
    tee /etc/systemd/system/vehicle-backend.service > /dev/null << EOF
[Unit]
Description=Vehicle Management Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=ALINUX3_OPTIMIZED=true

[Install]
WantedBy=multi-user.target
EOF

    # 创建前端服务文件
    tee /etc/systemd/system/vehicle-frontend.service > /dev/null << EOF
[Unit]
Description=Vehicle Management Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/frontend
ExecStart=/usr/bin/npm run preview -- --port 3000 --host 0.0.0.0
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=ALINUX3_OPTIMIZED=true

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载systemd
    systemctl daemon-reload
    
    log_success "systemd服务创建完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."
    
    # 创建Nginx配置
    if [[ -n "$DOMAIN_NAME" ]]; then
        # 有域名的情况
        tee /etc/nginx/conf.d/vehicle-management.conf > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 后端API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    else
        # 无域名的情况，使用IP访问
        tee /etc/nginx/conf.d/vehicle-management.conf > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 后端API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    fi

    # 确保conf.d目录存在
    mkdir -p /etc/nginx/conf.d
    
    # 备份默认配置
    if [[ -f /etc/nginx/nginx.conf ]]; then
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    fi
    
    # 确保nginx.conf包含conf.d目录
    if ! grep -q "include /etc/nginx/conf.d/\*.conf;" /etc/nginx/nginx.conf; then
        sed -i '/http {/a\    include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf
    fi
    
    # 测试Nginx配置
    nginx -t
    
    # 启动Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx配置完成"
}

# 配置SSL证书
configure_ssl() {
    if [[ -n "$DOMAIN_NAME" && -n "$EMAIL" ]]; then
        log_info "配置SSL证书..."
        
        # 使用certbot获取SSL证书
        certbot --nginx -d $DOMAIN_NAME --email $EMAIL --agree-tos --non-interactive
        
        # 设置自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        log_success "SSL证书配置完成"
    else
        log_warning "跳过SSL证书配置（需要域名和邮箱）"
    fi
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动后端服务
    systemctl start vehicle-backend
    systemctl enable vehicle-backend
    
    # 启动前端服务
    systemctl start vehicle-frontend
    systemctl enable vehicle-frontend
    
    # 等待服务启动
    sleep 5
    
    # 检查服务状态
    if systemctl is-active --quiet vehicle-backend; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        systemctl status vehicle-backend
    fi
    
    if systemctl is-active --quiet vehicle-frontend; then
        log_success "前端服务启动成功"
    else
        log_error "前端服务启动失败"
        systemctl status vehicle-frontend
    fi
    
    log_success "所有服务启动完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置Alibaba Cloud Linux 3防火墙..."
    
    # 确保firewalld已安装并启动
    if ! systemctl is-active --quiet firewalld; then
        systemctl start firewalld
    fi
    systemctl enable firewalld
    
    # 配置防火墙规则
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=5000/tcp
    
    # 重新加载防火墙规则
    firewall-cmd --reload
    
    # 检查防火墙状态
    firewall-cmd --list-all
    
    log_success "Alibaba Cloud Linux 3防火墙配置完成"
}

# 配置阿里云安全组
configure_aliyun_security_group() {
    if [[ -n "$ALIYUN_ACCESS_KEY" && -n "$ALIYUN_SECRET_KEY" ]]; then
        log_info "配置阿里云安全组..."
        
        # 检查阿里云CLI是否已安装
        if ! command -v aliyun &> /dev/null; then
            log_info "安装阿里云CLI..."
            # 手动安装阿里云CLI
            wget https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz
            tar -xzf aliyun-cli-linux-latest-amd64.tgz
            mv aliyun /usr/local/bin/
            rm aliyun-cli-linux-latest-amd64.tgz
            log_success "阿里云CLI安装完成"
        else
            log_info "阿里云CLI已安装"
        fi
        
        # 配置阿里云CLI
        aliyun configure set \
            --profile default \
            --mode AK \
            --region $REGION \
            --access-key-id $ALIYUN_ACCESS_KEY \
            --access-key-secret $ALIYUN_SECRET_KEY
        
        # 获取当前实例ID
        INSTANCE_ID=$(curl -s http://100.100.100.200/latest/meta-data/instance-id)
        
        # 获取安全组ID
        SECURITY_GROUP_ID=$(aliyun ecs DescribeInstances --InstanceIds "[\"$INSTANCE_ID\"]" --query 'Instances.Instance[0].SecurityGroupIds.SecurityGroupId[0]' --output text)
        
        # 添加安全组规则
        aliyun ecs AuthorizeSecurityGroup \
            --SecurityGroupId $SECURITY_GROUP_ID \
            --IpProtocol tcp \
            --PortRange 80/80 \
            --SourceCidrIp 0.0.0.0/0
        
        aliyun ecs AuthorizeSecurityGroup \
            --SecurityGroupId $SECURITY_GROUP_ID \
            --IpProtocol tcp \
            --PortRange 443/443 \
            --SourceCidrIp 0.0.0.0/0
        
        log_success "阿里云安全组配置完成"
    else
        log_warning "跳过阿里云安全组配置（需要Access Key）"
    fi
}

# 配置Alibaba Cloud Linux 3优化
configure_alinux3_optimizations() {
    log_info "配置Alibaba Cloud Linux 3优化..."
    
    # 配置内核参数优化
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
    
    # 配置文件描述符限制
    cat >> /etc/security/limits.conf << 'EOF'
# Alibaba Cloud Linux 3 文件描述符限制
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF
    
    # 配置Nginx优化
    cat >> /etc/nginx/nginx.conf << 'EOF'
# Alibaba Cloud Linux 3 Nginx 优化
worker_processes auto;
worker_connections 1024;
worker_rlimit_nofile 65535;

# 启用gzip压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 缓存配置
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
EOF
    
    # 重新加载Nginx配置
    systemctl reload nginx
    
    log_success "Alibaba Cloud Linux 3优化配置完成"
}

# 显示部署信息
show_deployment_info() {
    log_info "部署完成！"
    
    # 获取公网IP
    PUBLIC_IP=$(curl -s http://100.100.100.200/latest/meta-data/public-ipv4 2>/dev/null || echo "无法获取")
    
    # 获取实例信息
    INSTANCE_ID=$(curl -s http://100.100.100.200/latest/meta-data/instance-id 2>/dev/null || echo "无法获取")
    INSTANCE_TYPE=$(curl -s http://100.100.100.200/latest/meta-data/instance-type 2>/dev/null || echo "无法获取")
    
    echo ""
    echo "=========================================="
    echo "      Alibaba Cloud Linux 3 部署信息"
    echo "=========================================="
    echo "项目目录: $PROJECT_DIR"
    echo "实例ID: $INSTANCE_ID"
    echo "实例类型: $INSTANCE_TYPE"
    echo "公网IP: $PUBLIC_IP"
    if [[ -n "$DOMAIN_NAME" ]]; then
        echo "域名: $DOMAIN_NAME"
        echo "访问地址: https://$DOMAIN_NAME"
    else
        echo "访问地址: http://$PUBLIC_IP"
    fi
    echo "后端API: http://$PUBLIC_IP/api"
    echo "健康检查: http://$PUBLIC_IP/health"
    echo ""
    echo "默认管理员账户:"
    echo "邮箱: admin@example.com"
    echo "密码: admin123"
    echo ""
    echo "服务管理命令:"
    echo "查看后端状态: systemctl status vehicle-backend"
    echo "查看前端状态: systemctl status vehicle-frontend"
    echo "重启后端: systemctl restart vehicle-backend"
    echo "重启前端: systemctl restart vehicle-frontend"
    echo "查看日志: journalctl -u vehicle-backend -f"
    echo ""
    echo "Alibaba Cloud Linux 3 特有命令:"
    echo "查看防火墙状态: firewall-cmd --list-all"
    echo "重启防火墙: systemctl restart firewalld"
    echo "查看Nginx状态: systemctl status nginx"
    echo "查看系统优化: sysctl -a | grep net.core"
    echo "查看Docker状态: systemctl status docker"
    echo ""
    echo "阿里云配置:"
    echo "地域: $REGION"
    echo "Access Key: ${ALIYUN_ACCESS_KEY:0:8}..."
    echo ""
    echo "优化特性:"
    echo "✅ 阿里云镜像源加速"
    echo "✅ Docker镜像加速器"
    echo "✅ 内核参数优化"
    echo "✅ 文件描述符优化"
    echo "✅ Nginx性能优化"
    echo "✅ 系统服务优化"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    echo "=========================================="
    echo "   车辆管理系统 Alibaba Cloud Linux 3 专用部署脚本"
    echo "=========================================="
    echo ""
    
    # 检查系统要求
    check_root
    check_alinux3_system
    
    # 获取用户配置
    get_user_config
    
    # 优化系统
    optimize_alinux3_system
    
    # 安装依赖
    install_dependencies
    install_nodejs
    install_docker
    install_docker_compose
    install_pm2
    
    # 部署项目
    create_project_directory
    deploy_project
    install_project_dependencies
    build_frontend
    configure_environment
    
    # 配置服务
    create_systemd_service
    configure_nginx
    configure_ssl
    configure_firewall
    configure_aliyun_security_group
    configure_alinux3_optimizations
    
    # 启动服务
    start_services
    
    # 显示部署信息
    show_deployment_info
    
    log_success "Alibaba Cloud Linux 3 部署完成！"
}

# 运行主函数
main "$@"
