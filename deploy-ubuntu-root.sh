#!/bin/bash

# 一键部署脚本 - Ubuntu服务器 (Root用户版本)
# 作者: AI Assistant
# 版本: 1.0
# 用途: 在Ubuntu服务器上使用root用户自动部署车辆管理系统

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要使用root用户运行"
        log_info "请以root用户身份运行此脚本"
        exit 1
    fi
    log_success "检测到root用户，开始部署..."
}

# 检查系统版本
check_system() {
    log_info "检查系统版本..."
    
    if ! command -v lsb_release &> /dev/null; then
        apt-get update
        apt-get install -y lsb-release
    fi
    
    OS_VERSION=$(lsb_release -rs)
    OS_NAME=$(lsb_release -is)
    
    if [[ "$OS_NAME" != "Ubuntu" ]]; then
        log_error "此脚本仅支持Ubuntu系统"
        exit 1
    fi
    
    log_success "系统检查通过: $OS_NAME $OS_VERSION"
}

# 安装系统依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    # 更新包列表
    apt-get update
    
    # 安装基础工具
    apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    log_success "系统依赖安装完成"
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
    
    # 安装Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
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
    
    PROJECT_DIR="/opt/vehicle-management"
    
    # 创建目录
    mkdir -p $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
    echo $PROJECT_DIR
}

# 部署项目文件
deploy_project() {
    log_info "部署项目文件..."
    
    PROJECT_DIR=$1
    log_info "部署项目文件:$PROJECT_DIR" 
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
    
    PROJECT_DIR=$1
    
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
EOF
    
    log_success "环境变量配置完成"
}

# 创建systemd服务文件
create_systemd_service() {
    log_info "创建systemd服务..."
    
    PROJECT_DIR=$1
    
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
    
    # 安装Nginx
    apt-get install -y nginx
    
    # 创建Nginx配置
    tee /etc/nginx/sites-available/vehicle-management > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 后端API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/vehicle-management /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    nginx -t
    
    # 重启Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log_success "Nginx配置完成"
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
    log_info "配置防火墙..."
    
    # 检查ufw是否安装
    if ! command -v ufw &> /dev/null; then
        apt-get install -y ufw
    fi
    
    # 配置防火墙规则
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_success "防火墙配置完成"
}

# 显示部署信息
show_deployment_info() {
    log_info "部署完成！"
    
    echo ""
    echo "=========================================="
    echo "           部署信息"
    echo "=========================================="
    echo "项目目录: $PROJECT_DIR"
    echo "前端地址: http://$(hostname -I | awk '{print $1}')"
    echo "后端API: http://$(hostname -I | awk '{print $1}')/api"
    echo "健康检查: http://$(hostname -I | awk '{print $1}')/health"
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
    echo "=========================================="
}

# 主函数
main() {
    echo "=========================================="
    echo "   车辆管理系统一键部署脚本 (Root版本)"
    echo "=========================================="
    echo ""
    
    # 检查系统要求
    check_root
    check_system
    
    # 安装依赖
    install_dependencies
    install_nodejs
    install_docker
    install_docker_compose
    install_pm2
    
    # 部署项目
    PROJECT_DIR=$(create_project_directory)
    deploy_project $PROJECT_DIR
    install_project_dependencies
    build_frontend
    configure_environment $PROJECT_DIR
    
    # 配置服务
    create_systemd_service $PROJECT_DIR
    configure_nginx
    configure_firewall
    
    # 启动服务
    start_services
    
    # 显示部署信息
    show_deployment_info
    
    log_success "部署完成！"
}

# 运行主函数
main "$@"
