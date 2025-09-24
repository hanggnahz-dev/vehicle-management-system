#!/bin/bash

# 测试Root用户部署脚本
# 此脚本用于验证deploy-ubuntu-root.sh脚本的语法和逻辑

set -e

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

# 检查脚本语法
check_syntax() {
    log_info "检查部署脚本语法..."
    
    if bash -n deploy-ubuntu-root.sh; then
        log_success "部署脚本语法检查通过"
    else
        log_error "部署脚本语法错误"
        exit 1
    fi
}

# 检查脚本权限
check_permissions() {
    log_info "检查脚本权限..."
    
    if [[ -x deploy-ubuntu-root.sh ]]; then
        log_success "部署脚本具有执行权限"
    else
        log_warning "部署脚本没有执行权限，正在添加..."
        chmod +x deploy-ubuntu-root.sh
        log_success "已添加执行权限"
    fi
}

# 检查脚本内容
check_content() {
    log_info "检查脚本内容..."
    
    # 检查是否包含必要的函数
    local required_functions=(
        "check_root"
        "check_system"
        "install_dependencies"
        "install_nodejs"
        "install_docker"
        "install_docker_compose"
        "install_pm2"
        "create_project_directory"
        "deploy_project"
        "install_project_dependencies"
        "build_frontend"
        "configure_environment"
        "create_systemd_service"
        "configure_nginx"
        "start_services"
        "configure_firewall"
        "show_deployment_info"
        "main"
    )
    
    for func in "${required_functions[@]}"; do
        if grep -q "^${func}()" deploy-ubuntu-root.sh; then
            log_success "找到函数: $func"
        else
            log_error "缺少函数: $func"
            exit 1
        fi
    done
}

# 检查root用户检测逻辑
check_root_logic() {
    log_info "检查root用户检测逻辑..."
    
    if grep -q "EUID -ne 0" deploy-ubuntu-root.sh; then
        log_success "root用户检测逻辑正确"
    else
        log_error "root用户检测逻辑错误"
        exit 1
    fi
}

# 检查sudo命令移除
check_sudo_removal() {
    log_info "检查sudo命令移除..."
    
    if grep -q "sudo " deploy-ubuntu-root.sh; then
        log_warning "脚本中仍包含sudo命令，这可能导致root用户部署时出现问题"
        grep -n "sudo " deploy-ubuntu-root.sh
    else
        log_success "脚本中已移除所有sudo命令"
    fi
}

# 检查systemd服务配置
check_systemd_config() {
    log_info "检查systemd服务配置..."
    
    if grep -q "User=root" deploy-ubuntu-root.sh; then
        log_success "systemd服务配置为root用户"
    else
        log_error "systemd服务配置错误，未设置为root用户"
        exit 1
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "      Root用户部署脚本测试"
    echo "=========================================="
    echo ""
    
    # 检查部署脚本是否存在
    if [[ ! -f deploy-ubuntu-root.sh ]]; then
        log_error "部署脚本 deploy-ubuntu-root.sh 不存在"
        exit 1
    fi
    
    # 运行所有检查
    check_syntax
    check_permissions
    check_content
    check_root_logic
    check_sudo_removal
    check_systemd_config
    
    echo ""
    echo "=========================================="
    log_success "所有检查通过！Root用户部署脚本准备就绪。"
    echo "=========================================="
    echo ""
    echo "使用方法："
    echo "1. 确保以root用户身份运行"
    echo "2. 执行: ./deploy-ubuntu-root.sh"
    echo ""
}

# 运行主函数
main "$@"
