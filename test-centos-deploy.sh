#!/bin/bash

# CentOS系列部署脚本测试工具
# 用于验证CentOS系列部署脚本的语法和逻辑

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
    log_info "检查CentOS系列部署脚本语法..."
    
    if bash -n deploy-aliyun-centos.sh; then
        log_success "CentOS系列部署脚本语法检查通过"
    else
        log_error "CentOS系列部署脚本语法错误"
        exit 1
    fi
}

# 检查脚本权限
check_permissions() {
    log_info "检查脚本权限..."
    
    if [[ -x deploy-aliyun-centos.sh ]]; then
        log_success "CentOS系列部署脚本具有执行权限"
    else
        log_warning "CentOS系列部署脚本没有执行权限，正在添加..."
        chmod +x deploy-aliyun-centos.sh
        log_success "已添加执行权限"
    fi
}

# 检查脚本内容
check_content() {
    log_info "检查CentOS系列脚本内容..."
    
    # 检查CentOS系列脚本是否包含必要的函数
    local required_functions=(
        "check_root"
        "check_centos_system"
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
        if grep -q "^${func}()" deploy-aliyun-centos.sh; then
            log_success "找到函数: $func"
        else
            log_error "缺少函数: $func"
            exit 1
        fi
    done
}

# 检查CentOS系列特定功能
check_centos_features() {
    log_info "检查CentOS系列特定功能..."
    
    # 检查包管理器支持
    if grep -q "dnf\|yum" deploy-aliyun-centos.sh; then
        log_success "包含CentOS系列包管理器支持"
    else
        log_error "缺少CentOS系列包管理器支持"
        exit 1
    fi
    
    # 检查firewalld配置
    if grep -q "firewalld" deploy-aliyun-centos.sh; then
        log_success "包含firewalld防火墙配置"
    else
        log_error "缺少firewalld防火墙配置"
        exit 1
    fi
    
    # 检查EPEL仓库
    if grep -q "epel-release" deploy-aliyun-centos.sh; then
        log_success "包含EPEL仓库安装"
    else
        log_error "缺少EPEL仓库安装"
        exit 1
    fi
    
    # 检查NodeSource RPM仓库
    if grep -q "rpm.nodesource.com" deploy-aliyun-centos.sh; then
        log_success "包含NodeSource RPM仓库配置"
    else
        log_error "缺少NodeSource RPM仓库配置"
        exit 1
    fi
}

# 检查系统检测功能
check_system_detection() {
    log_info "检查系统检测功能..."
    
    # 检查CentOS系列检测
    if grep -q "centos\|rhel\|rocky\|almalinux" deploy-aliyun-centos.sh; then
        log_success "包含CentOS系列系统检测"
    else
        log_error "缺少CentOS系列系统检测"
        exit 1
    fi
    
    # 检查包管理器检测
    if grep -q "PACKAGE_MANAGER" deploy-aliyun-centos.sh; then
        log_success "包含包管理器检测"
    else
        log_error "缺少包管理器检测"
        exit 1
    fi
}

# 检查Nginx配置
check_nginx_config() {
    log_info "检查Nginx配置..."
    
    # 检查conf.d目录配置
    if grep -q "conf.d" deploy-aliyun-centos.sh; then
        log_success "包含conf.d目录配置"
    else
        log_error "缺少conf.d目录配置"
        exit 1
    fi
    
    # 检查nginx.conf修改
    if grep -q "nginx.conf" deploy-aliyun-centos.sh; then
        log_success "包含nginx.conf配置修改"
    else
        log_error "缺少nginx.conf配置修改"
        exit 1
    fi
}

# 检查防火墙配置
check_firewall_config() {
    log_info "检查防火墙配置..."
    
    # 检查firewall-cmd命令
    if grep -q "firewall-cmd" deploy-aliyun-centos.sh; then
        log_success "包含firewall-cmd配置"
    else
        log_error "缺少firewall-cmd配置"
        exit 1
    fi
    
    # 检查防火墙规则
    if grep -q "add-service\|add-port" deploy-aliyun-centos.sh; then
        log_success "包含防火墙规则配置"
    else
        log_error "缺少防火墙规则配置"
        exit 1
    fi
}

# 检查服务管理
check_service_management() {
    log_info "检查服务管理..."
    
    # 检查systemctl命令
    if grep -q "systemctl" deploy-aliyun-centos.sh; then
        log_success "包含systemctl服务管理"
    else
        log_error "缺少systemctl服务管理"
        exit 1
    fi
    
    # 检查服务启动和启用
    if grep -q "start\|enable" deploy-aliyun-centos.sh; then
        log_success "包含服务启动和启用"
    else
        log_error "缺少服务启动和启用"
        exit 1
    fi
}

# 检查依赖安装
check_dependency_installation() {
    log_info "检查依赖安装..."
    
    # 检查基础依赖
    local dependencies=(
        "curl"
        "wget"
        "git"
        "gcc"
        "nginx"
        "firewalld"
        "certbot"
    )
    
    for dep in "${dependencies[@]}"; do
        if grep -q "$dep" deploy-aliyun-centos.sh; then
            log_success "包含依赖: $dep"
        else
            log_error "缺少依赖: $dep"
            exit 1
        fi
    done
}

# 主函数
main() {
    echo "=========================================="
    echo "      CentOS系列部署脚本测试"
    echo "=========================================="
    echo ""
    
    # 检查部署脚本是否存在
    if [[ ! -f deploy-aliyun-centos.sh ]]; then
        log_error "CentOS系列部署脚本 deploy-aliyun-centos.sh 不存在"
        exit 1
    fi
    
    # 运行所有检查
    check_syntax
    check_permissions
    check_content
    check_centos_features
    check_system_detection
    check_nginx_config
    check_firewall_config
    check_service_management
    check_dependency_installation
    
    echo ""
    echo "=========================================="
    log_success "所有检查通过！CentOS系列部署脚本准备就绪。"
    echo "=========================================="
    echo ""
    echo "支持的CentOS系列系统："
    echo "- CentOS 7/8/9"
    echo "- Red Hat Enterprise Linux (RHEL)"
    echo "- Rocky Linux"
    echo "- AlmaLinux"
    echo "- Alibaba Cloud Linux"
    echo ""
    echo "使用方法："
    echo "1. 确保以root用户身份运行"
    echo "2. 准备阿里云Access Key"
    echo "3. 执行: ./deploy-aliyun-centos.sh"
    echo ""
    echo "注意事项："
    echo "- 确保ECS实例有公网IP"
    echo "- 确保域名已备案（如使用域名）"
    echo "- 确保Access Key有足够权限"
    echo "- 脚本会自动检测包管理器（yum/dnf）"
    echo ""
}

# 运行主函数
main "$@"
