#!/bin/bash

# 阿里云部署脚本测试工具
# 用于验证部署脚本的语法和逻辑

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    log_info "检查阿里云部署脚本语法..."
    
    if bash -n deploy-aliyun.sh; then
        log_success "阿里云部署脚本语法检查通过"
    else
        log_error "阿里云部署脚本语法错误"
        exit 1
    fi
    
    if bash -n quick-deploy-aliyun.sh; then
        log_success "快速部署脚本语法检查通过"
    else
        log_error "快速部署脚本语法错误"
        exit 1
    fi
}

# 检查脚本权限
check_permissions() {
    log_info "检查脚本权限..."
    
    if [[ -x deploy-aliyun.sh ]]; then
        log_success "阿里云部署脚本具有执行权限"
    else
        log_warning "阿里云部署脚本没有执行权限，正在添加..."
        chmod +x deploy-aliyun.sh
        log_success "已添加执行权限"
    fi
    
    if [[ -x quick-deploy-aliyun.sh ]]; then
        log_success "快速部署脚本具有执行权限"
    else
        log_warning "快速部署脚本没有执行权限，正在添加..."
        chmod +x quick-deploy-aliyun.sh
        log_success "已添加执行权限"
    fi
}

# 检查脚本内容
check_content() {
    log_info "检查脚本内容..."
    
    # 检查阿里云部署脚本是否包含必要的函数
    local required_functions=(
        "check_root"
        "check_system"
        "get_user_config"
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
        "configure_ssl"
        "start_services"
        "configure_firewall"
        "configure_aliyun_security_group"
        "show_deployment_info"
        "main"
    )
    
    for func in "${required_functions[@]}"; do
        if grep -q "^${func}()" deploy-aliyun.sh; then
            log_success "找到函数: $func"
        else
            log_error "缺少函数: $func"
            exit 1
        fi
    done
}

# 检查阿里云相关功能
check_aliyun_features() {
    log_info "检查阿里云相关功能..."
    
    # 检查阿里云CLI安装
    if grep -q "aliyun-cli-linux-latest-amd64.tgz" deploy-aliyun.sh; then
        log_success "包含阿里云CLI安装逻辑"
    else
        log_error "缺少阿里云CLI安装逻辑"
        exit 1
    fi
    
    # 检查安全组配置
    if grep -q "AuthorizeSecurityGroup" deploy-aliyun.sh; then
        log_success "包含安全组配置逻辑"
    else
        log_error "缺少安全组配置逻辑"
        exit 1
    fi
    
    # 检查SSL证书配置
    if grep -q "certbot" deploy-aliyun.sh; then
        log_success "包含SSL证书配置逻辑"
    else
        log_error "缺少SSL证书配置逻辑"
        exit 1
    fi
}

# 检查系统兼容性
check_system_compatibility() {
    log_info "检查系统兼容性..."
    
    # 检查Ubuntu支持
    if grep -q "apt-get" deploy-aliyun.sh; then
        log_success "支持Ubuntu系统"
    else
        log_warning "未检测到Ubuntu支持"
    fi
    
    # 检查CentOS支持
    if grep -q "yum" deploy-aliyun.sh; then
        log_success "支持CentOS系统"
    else
        log_warning "未检测到CentOS支持"
    fi
    
    # 检查Alibaba Cloud Linux支持
    if grep -q "Alibaba Cloud Linux" deploy-aliyun.sh; then
        log_success "支持Alibaba Cloud Linux"
    else
        log_warning "未检测到Alibaba Cloud Linux支持"
    fi
}

# 检查网络配置
check_network_config() {
    log_info "检查网络配置..."
    
    # 检查防火墙配置
    if grep -q "ufw" deploy-aliyun.sh && grep -q "firewall-cmd" deploy-aliyun.sh; then
        log_success "包含防火墙配置逻辑"
    else
        log_error "缺少防火墙配置逻辑"
        exit 1
    fi
    
    # 检查Nginx配置
    if grep -q "nginx" deploy-aliyun.sh; then
        log_success "包含Nginx配置逻辑"
    else
        log_error "缺少Nginx配置逻辑"
        exit 1
    fi
}

# 检查服务配置
check_service_config() {
    log_info "检查服务配置..."
    
    # 检查systemd服务配置
    if grep -q "systemd" deploy-aliyun.sh; then
        log_success "包含systemd服务配置"
    else
        log_error "缺少systemd服务配置"
        exit 1
    fi
    
    # 检查PM2配置
    if grep -q "pm2" deploy-aliyun.sh; then
        log_success "包含PM2配置"
    else
        log_error "缺少PM2配置"
        exit 1
    fi
}

# 检查环境变量配置
check_environment_config() {
    log_info "检查环境变量配置..."
    
    # 检查.env文件创建
    if grep -q ".env" deploy-aliyun.sh; then
        log_success "包含环境变量配置"
    else
        log_error "缺少环境变量配置"
        exit 1
    fi
    
    # 检查JWT配置
    if grep -q "JWT_SECRET" deploy-aliyun.sh; then
        log_success "包含JWT配置"
    else
        log_error "缺少JWT配置"
        exit 1
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "     阿里云部署脚本测试"
    echo "=========================================="
    echo ""
    
    # 检查部署脚本是否存在
    if [[ ! -f deploy-aliyun.sh ]]; then
        log_error "阿里云部署脚本 deploy-aliyun.sh 不存在"
        exit 1
    fi
    
    if [[ ! -f quick-deploy-aliyun.sh ]]; then
        log_error "快速部署脚本 quick-deploy-aliyun.sh 不存在"
        exit 1
    fi
    
    # 运行所有检查
    check_syntax
    check_permissions
    check_content
    check_aliyun_features
    check_system_compatibility
    check_network_config
    check_service_config
    check_environment_config
    
    echo ""
    echo "=========================================="
    log_success "所有检查通过！阿里云部署脚本准备就绪。"
    echo "=========================================="
    echo ""
    echo "使用方法："
    echo "1. 确保以root用户身份运行"
    echo "2. 准备阿里云Access Key"
    echo "3. 执行: ./deploy-aliyun.sh"
    echo "4. 或使用快速部署: ./quick-deploy-aliyun.sh"
    echo ""
    echo "注意事项："
    echo "- 确保ECS实例有公网IP"
    echo "- 确保域名已备案（如使用域名）"
    echo "- 确保Access Key有足够权限"
    echo ""
}

# 运行主函数
main "$@"
