#!/bin/bash

# Alibaba Cloud Linux 3 部署脚本测试工具
# 用于验证 Alibaba Cloud Linux 3 部署脚本的语法和逻辑

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
    log_info "检查 Alibaba Cloud Linux 3 部署脚本语法..."
    
    if bash -n deploy-aliyun-alinux3.sh; then
        log_success "Alibaba Cloud Linux 3 部署脚本语法检查通过"
    else
        log_error "Alibaba Cloud Linux 3 部署脚本语法错误"
        exit 1
    fi
}

# 检查脚本权限
check_permissions() {
    log_info "检查脚本权限..."
    
    if [[ -x deploy-aliyun-alinux3.sh ]]; then
        log_success "Alibaba Cloud Linux 3 部署脚本具有执行权限"
    else
        log_warning "Alibaba Cloud Linux 3 部署脚本没有执行权限，正在添加..."
        chmod +x deploy-aliyun-alinux3.sh
        log_success "已添加执行权限"
    fi
}

# 检查脚本内容
check_content() {
    log_info "检查 Alibaba Cloud Linux 3 脚本内容..."
    
    # 检查 Alibaba Cloud Linux 3 脚本是否包含必要的函数
    local required_functions=(
        "check_root"
        "check_alinux3_system"
        "get_user_config"
        "optimize_alinux3_system"
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
        "configure_alinux3_optimizations"
        "show_deployment_info"
        "main"
    )
    
    for func in "${required_functions[@]}"; do
        if grep -q "^${func}()" deploy-aliyun-alinux3.sh; then
            log_success "找到函数: $func"
        else
            log_error "缺少函数: $func"
            exit 1
        fi
    done
}

# 检查 Alibaba Cloud Linux 3 特定功能
check_alinux3_features() {
    log_info "检查 Alibaba Cloud Linux 3 特定功能..."
    
    # 检查系统检测
    if grep -q "alinux.*3" deploy-aliyun-alinux3.sh; then
        log_success "包含 Alibaba Cloud Linux 3 系统检测"
    else
        log_error "缺少 Alibaba Cloud Linux 3 系统检测"
        exit 1
    fi
    
    # 检查阿里云优化
    if grep -q "optimize_alinux3_system" deploy-aliyun-alinux3.sh; then
        log_success "包含 Alibaba Cloud Linux 3 系统优化"
    else
        log_error "缺少 Alibaba Cloud Linux 3 系统优化"
        exit 1
    fi
    
    # 检查阿里云镜像源
    if grep -q "mirrors.aliyun.com" deploy-aliyun-alinux3.sh; then
        log_success "包含阿里云镜像源配置"
    else
        log_error "缺少阿里云镜像源配置"
        exit 1
    fi
    
    # 检查阿里云工具
    if grep -q "aliyun-cli" deploy-aliyun-alinux3.sh; then
        log_success "包含阿里云工具安装"
    else
        log_error "缺少阿里云工具安装"
        exit 1
    fi
    
    # 检查Docker镜像加速器
    if grep -q "registry-mirrors" deploy-aliyun-alinux3.sh; then
        log_success "包含Docker镜像加速器配置"
    else
        log_error "缺少Docker镜像加速器配置"
        exit 1
    fi
    
    # 检查系统优化
    if grep -q "configure_alinux3_optimizations" deploy-aliyun-alinux3.sh; then
        log_success "包含 Alibaba Cloud Linux 3 系统优化配置"
    else
        log_error "缺少 Alibaba Cloud Linux 3 系统优化配置"
        exit 1
    fi
}

# 检查包管理器支持
check_package_manager() {
    log_info "检查包管理器支持..."
    
    # 检查dnf支持
    if grep -q "dnf" deploy-aliyun-alinux3.sh; then
        log_success "包含 dnf 包管理器支持"
    else
        log_error "缺少 dnf 包管理器支持"
        exit 1
    fi
    
    # 检查yum支持
    if grep -q "yum" deploy-aliyun-alinux3.sh; then
        log_success "包含 yum 包管理器支持"
    else
        log_error "缺少 yum 包管理器支持"
        exit 1
    fi
    
    # 检查EPEL仓库
    if grep -q "epel-release" deploy-aliyun-alinux3.sh; then
        log_success "包含 EPEL 仓库安装"
    else
        log_error "缺少 EPEL 仓库安装"
        exit 1
    fi
}

# 检查Node.js安装
check_nodejs_installation() {
    log_info "检查 Node.js 安装..."
    
    # 检查NodeSource仓库
    if grep -q "rpm.nodesource.com" deploy-aliyun-alinux3.sh; then
        log_success "包含 NodeSource RPM 仓库配置"
    else
        log_error "缺少 NodeSource RPM 仓库配置"
        exit 1
    fi
    
    # 检查Node.js版本检查
    if grep -q "NODE_MAJOR" deploy-aliyun-alinux3.sh; then
        log_success "包含 Node.js 版本检查"
    else
        log_error "缺少 Node.js 版本检查"
        exit 1
    fi
}

# 检查Docker配置
check_docker_config() {
    log_info "检查 Docker 配置..."
    
    # 检查Docker安装（使用阿里云官方方法）
    if grep -q "docker-ce.repo" deploy-aliyun-alinux3.sh; then
        log_success "包含 Docker 安装"
    else
        log_error "缺少 Docker 安装"
        exit 1
    fi
    
    # 检查Docker Compose安装
    if grep -q "docker-compose" deploy-aliyun-alinux3.sh; then
        log_success "包含 Docker Compose 安装"
    else
        log_error "缺少 Docker Compose 安装"
        exit 1
    fi
    
    # 检查Docker镜像加速器
    if grep -q "daemon.json" deploy-aliyun-alinux3.sh; then
        log_success "包含 Docker 镜像加速器配置"
    else
        log_error "缺少 Docker 镜像加速器配置"
        exit 1
    fi
}

# 检查防火墙配置
check_firewall_config() {
    log_info "检查防火墙配置..."
    
    # 检查firewalld配置
    if grep -q "firewalld" deploy-aliyun-alinux3.sh; then
        log_success "包含 firewalld 防火墙配置"
    else
        log_error "缺少 firewalld 防火墙配置"
        exit 1
    fi
    
    # 检查防火墙规则
    if grep -q "firewall-cmd" deploy-aliyun-alinux3.sh; then
        log_success "包含防火墙规则配置"
    else
        log_error "缺少防火墙规则配置"
        exit 1
    fi
}

# 检查Nginx配置
check_nginx_config() {
    log_info "检查 Nginx 配置..."
    
    # 检查Nginx安装
    if grep -q "nginx" deploy-aliyun-alinux3.sh; then
        log_success "包含 Nginx 安装"
    else
        log_error "缺少 Nginx 安装"
        exit 1
    fi
    
    # 检查Nginx配置
    if grep -q "conf.d" deploy-aliyun-alinux3.sh; then
        log_success "包含 Nginx 配置"
    else
        log_error "缺少 Nginx 配置"
        exit 1
    fi
    
    # 检查Nginx优化
    if grep -q "worker_processes\|gzip" deploy-aliyun-alinux3.sh; then
        log_success "包含 Nginx 性能优化"
    else
        log_error "缺少 Nginx 性能优化"
        exit 1
    fi
}

# 检查系统优化
check_system_optimizations() {
    log_info "检查系统优化..."
    
    # 检查内核参数优化
    if grep -q "sysctl.conf" deploy-aliyun-alinux3.sh; then
        log_success "包含内核参数优化"
    else
        log_error "缺少内核参数优化"
        exit 1
    fi
    
    # 检查文件描述符限制
    if grep -q "limits.conf" deploy-aliyun-alinux3.sh; then
        log_success "包含文件描述符限制配置"
    else
        log_error "缺少文件描述符限制配置"
        exit 1
    fi
    
    # 检查系统服务优化
    if grep -q "systemctl.*enable" deploy-aliyun-alinux3.sh; then
        log_success "包含系统服务优化"
    else
        log_error "缺少系统服务优化"
        exit 1
    fi
}

# 检查阿里云集成
check_aliyun_integration() {
    log_info "检查阿里云集成..."
    
    # 检查阿里云CLI
    if grep -q "aliyun.*configure" deploy-aliyun-alinux3.sh; then
        log_success "包含阿里云 CLI 配置"
    else
        log_error "缺少阿里云 CLI 配置"
        exit 1
    fi
    
    # 检查安全组配置
    if grep -q "AuthorizeSecurityGroup" deploy-aliyun-alinux3.sh; then
        log_success "包含阿里云安全组配置"
    else
        log_error "缺少阿里云安全组配置"
        exit 1
    fi
    
    # 检查实例元数据
    if grep -q "100.100.100.200" deploy-aliyun-alinux3.sh; then
        log_success "包含阿里云实例元数据访问"
    else
        log_error "缺少阿里云实例元数据访问"
        exit 1
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "      Alibaba Cloud Linux 3 部署脚本测试"
    echo "=========================================="
    echo ""
    
    # 检查部署脚本是否存在
    if [[ ! -f deploy-aliyun-alinux3.sh ]]; then
        log_error "Alibaba Cloud Linux 3 部署脚本 deploy-aliyun-alinux3.sh 不存在"
        exit 1
    fi
    
    # 运行所有检查
    check_syntax
    check_permissions
    check_content
    check_alinux3_features
    check_package_manager
    check_nodejs_installation
    check_docker_config
    check_firewall_config
    check_nginx_config
    check_system_optimizations
    check_aliyun_integration
    
    echo ""
    echo "=========================================="
    log_success "所有检查通过！Alibaba Cloud Linux 3 部署脚本准备就绪。"
    echo "=========================================="
    echo ""
    echo "支持的 Alibaba Cloud Linux 3 特性："
    echo "- 阿里云镜像源加速"
    echo "- Docker 镜像加速器"
    echo "- 内核参数优化"
    echo "- 文件描述符优化"
    echo "- Nginx 性能优化"
    echo "- 系统服务优化"
    echo "- 阿里云工具集成"
    echo "- 安全组自动配置"
    echo ""
    echo "使用方法："
    echo "1. 确保以 root 用户身份运行"
    echo "2. 准备阿里云 Access Key"
    echo "3. 执行: ./deploy-aliyun-alinux3.sh"
    echo ""
    echo "注意事项："
    echo "- 确保 ECS 实例有公网 IP"
    echo "- 确保域名已备案（如使用域名）"
    echo "- 确保 Access Key 有足够权限"
    echo "- 脚本会自动检测包管理器（yum/dnf）"
    echo "- 自动配置阿里云镜像源和 Docker 加速器"
    echo ""
}

# 运行主函数
main "$@"
