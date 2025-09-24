#!/bin/bash

# 404页面诊断脚本
echo "=========================================="
echo "        404页面诊断脚本"
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

# 检查Nginx状态
log_info "=== Nginx服务状态 ==="
if systemctl is-active --quiet nginx; then
    log_success "Nginx服务正在运行"
else
    log_error "Nginx服务未运行"
    log_info "尝试启动Nginx..."
    systemctl start nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx服务启动成功"
    else
        log_error "Nginx服务启动失败"
        log_info "Nginx错误日志："
        journalctl -u nginx --no-pager -n 20
    fi
fi

# 检查Nginx配置
log_info "=== Nginx配置检查 ==="
if nginx -t; then
    log_success "Nginx配置语法正确"
else
    log_error "Nginx配置语法错误"
    nginx -t 2>&1
fi

# 检查前端文件
log_info "=== 前端文件检查 ==="
FRONTEND_DIR="/opt/vehicle-management/frontend/dist"
if [[ -d "$FRONTEND_DIR" ]]; then
    log_success "前端构建目录存在: $FRONTEND_DIR"
    ls -la "$FRONTEND_DIR"
    
    if [[ -f "$FRONTEND_DIR/index.html" ]]; then
        log_success "index.html文件存在"
        log_info "index.html内容预览："
        head -10 "$FRONTEND_DIR/index.html"
    else
        log_error "index.html文件不存在"
    fi
else
    log_error "前端构建目录不存在: $FRONTEND_DIR"
    log_info "检查前端源码目录..."
    if [[ -d "/opt/vehicle-management/frontend" ]]; then
        log_info "前端源码目录存在，尝试重新构建..."
        cd /opt/vehicle-management/frontend
        if npm run build; then
            log_success "前端重新构建成功"
        else
            log_error "前端重新构建失败"
        fi
    else
        log_error "前端源码目录不存在"
    fi
fi

# 检查后端服务
log_info "=== 后端服务状态 ==="
if systemctl is-active --quiet vehicle-backend; then
    log_success "后端服务正在运行"
else
    log_error "后端服务未运行"
    log_info "尝试启动后端服务..."
    systemctl start vehicle-backend
    if systemctl is-active --quiet vehicle-backend; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        log_info "后端服务错误日志："
        journalctl -u vehicle-backend --no-pager -n 20
    fi
fi

# 检查端口占用
log_info "=== 端口占用检查 ==="
if netstat -tlnp | grep -q ":80"; then
    log_success "端口80已被占用"
    netstat -tlnp | grep ":80"
else
    log_error "端口80未被占用"
fi

if netstat -tlnp | grep -q ":5000"; then
    log_success "端口5000已被占用"
    netstat -tlnp | grep ":5000"
else
    log_error "端口5000未被占用"
fi

# 检查Nginx访问日志
log_info "=== Nginx访问日志 ==="
if [[ -f "/var/log/nginx/access.log" ]]; then
    log_info "最近的访问日志："
    tail -20 /var/log/nginx/access.log
else
    log_warning "Nginx访问日志文件不存在"
fi

# 检查Nginx错误日志
log_info "=== Nginx错误日志 ==="
if [[ -f "/var/log/nginx/error.log" ]]; then
    log_info "最近的错误日志："
    tail -20 /var/log/nginx/error.log
else
    log_warning "Nginx错误日志文件不存在"
fi

# 测试API连接
log_info "=== API连接测试 ==="
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    log_success "后端API健康检查通过"
else
    log_error "后端API健康检查失败"
    log_info "尝试直接访问API..."
    curl -v http://localhost:5000/health
fi

# 测试前端访问
log_info "=== 前端访问测试 ==="
if curl -f http://localhost/ > /dev/null 2>&1; then
    log_success "前端页面访问成功"
else
    log_error "前端页面访问失败"
    log_info "尝试直接访问前端..."
    curl -v http://localhost/
fi

# 检查文件权限
log_info "=== 文件权限检查 ==="
if [[ -d "$FRONTEND_DIR" ]]; then
    log_info "前端目录权限："
    ls -la "$FRONTEND_DIR"
    
    # 检查nginx用户权限
    if [[ -r "$FRONTEND_DIR/index.html" ]]; then
        log_success "nginx用户可以读取index.html"
    else
        log_error "nginx用户无法读取index.html"
        log_info "尝试修复权限..."
        chmod -R 755 "$FRONTEND_DIR"
        chown -R nginx:nginx "$FRONTEND_DIR"
    fi
fi

# 检查Nginx配置内容
log_info "=== Nginx配置内容 ==="
if [[ -f "/etc/nginx/conf.d/vehicle-management.conf" ]]; then
    log_info "vehicle-management.conf配置内容："
    cat /etc/nginx/conf.d/vehicle-management.conf
else
    log_error "vehicle-management.conf配置文件不存在"
fi

echo ""
echo "=========================================="
echo "        诊断完成"
echo "=========================================="
echo ""
echo "如果问题仍然存在，请检查："
echo "1. 前端是否正确构建"
echo "2. Nginx配置是否正确"
echo "3. 文件权限是否正确"
echo "4. 服务是否正常运行"
echo "5. 防火墙是否阻止访问"
