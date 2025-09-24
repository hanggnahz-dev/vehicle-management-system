#!/bin/bash

# 404页面快速修复脚本
echo "=========================================="
echo "        404页面快速修复脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
if [[ $EUID -ne 0 ]]; then
    log_error "此脚本需要root权限运行"
    log_info "请使用: sudo $0"
    exit 1
fi

PROJECT_DIR="/opt/vehicle-management"

log_info "开始修复404页面问题..."

# 1. 检查并重新构建前端
log_info "=== 步骤1: 重新构建前端 ==="
if [[ -d "$PROJECT_DIR/frontend" ]]; then
    cd "$PROJECT_DIR/frontend"
    log_info "清理旧的构建文件..."
    rm -rf dist/
    
    log_info "重新安装前端依赖..."
    npm install
    
    log_info "重新构建前端..."
    if npm run build; then
        log_success "前端重新构建成功"
    else
        log_error "前端重新构建失败"
        exit 1
    fi
else
    log_error "前端源码目录不存在: $PROJECT_DIR/frontend"
    exit 1
fi

# 2. 检查并修复文件权限
log_info "=== 步骤2: 修复文件权限 ==="
if [[ -d "$PROJECT_DIR/frontend/dist" ]]; then
    log_info "设置前端文件权限..."
    chmod -R 755 "$PROJECT_DIR/frontend/dist"
    chown -R nginx:nginx "$PROJECT_DIR/frontend/dist"
    log_success "前端文件权限设置完成"
else
    log_error "前端构建目录不存在"
    exit 1
fi

# 3. 检查并重启Nginx
log_info "=== 步骤3: 重启Nginx服务 ==="
if systemctl is-active --quiet nginx; then
    log_info "重新加载Nginx配置..."
    nginx -t && systemctl reload nginx
    log_success "Nginx配置重新加载成功"
else
    log_info "启动Nginx服务..."
    systemctl start nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx服务启动成功"
    else
        log_error "Nginx服务启动失败"
        log_info "Nginx错误日志："
        journalctl -u nginx --no-pager -n 10
        exit 1
    fi
fi

# 4. 检查后端服务
log_info "=== 步骤4: 检查后端服务 ==="
if systemctl is-active --quiet vehicle-backend; then
    log_success "后端服务正在运行"
else
    log_info "启动后端服务..."
    systemctl start vehicle-backend
    if systemctl is-active --quiet vehicle-backend; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        log_info "后端服务错误日志："
        journalctl -u vehicle-backend --no-pager -n 10
    fi
fi

# 5. 测试访问
log_info "=== 步骤5: 测试访问 ==="
sleep 3

# 测试后端API
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    log_success "后端API访问正常"
else
    log_warning "后端API访问异常"
fi

# 测试前端页面
if curl -f http://localhost/ > /dev/null 2>&1; then
    log_success "前端页面访问正常"
else
    log_warning "前端页面访问异常"
    log_info "检查Nginx错误日志："
    tail -10 /var/log/nginx/error.log
fi

# 6. 显示服务状态
log_info "=== 步骤6: 服务状态 ==="
echo "Nginx状态: $(systemctl is-active nginx)"
echo "后端服务状态: $(systemctl is-active vehicle-backend)"
echo "端口80占用: $(netstat -tlnp | grep ':80' | wc -l)"
echo "端口5000占用: $(netstat -tlnp | grep ':5000' | wc -l)"

echo ""
echo "=========================================="
echo "        修复完成"
echo "=========================================="
echo ""
echo "请尝试访问以下地址："
echo "• 前端页面: http://your-server-ip/"
echo "• 后端API: http://your-server-ip/api/"
echo "• 健康检查: http://your-server-ip/health"
echo ""
echo "如果仍然显示404，请运行诊断脚本："
echo "sudo $PROJECT_DIR/diagnose-404.sh"
