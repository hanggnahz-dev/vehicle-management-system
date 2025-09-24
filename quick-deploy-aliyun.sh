#!/bin/bash

# 阿里云快速部署脚本
# 适用于已有阿里云ECS实例的快速部署

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

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
    log_error "此脚本需要使用root用户运行"
    exit 1
fi

echo "=========================================="
echo "   阿里云快速部署脚本"
echo "=========================================="
echo ""

# 获取配置
read -p "请输入域名 (可选，直接回车跳过): " DOMAIN_NAME
read -p "请输入邮箱 (用于SSL证书): " EMAIL
read -p "请输入阿里云Access Key ID: " ALIYUN_ACCESS_KEY
read -s -p "请输入阿里云Access Key Secret: " ALIYUN_SECRET_KEY
echo
read -p "请输入阿里云地域 (默认: cn-hangzhou): " REGION
REGION=${REGION:-cn-hangzhou}

# 设置环境变量
export DOMAIN_NAME="$DOMAIN_NAME"
export EMAIL="$EMAIL"
export ALIYUN_ACCESS_KEY="$ALIYUN_ACCESS_KEY"
export ALIYUN_SECRET_KEY="$ALIYUN_SECRET_KEY"
export REGION="$REGION"

log_info "开始快速部署..."

# 运行主部署脚本
./deploy-aliyun.sh

log_success "快速部署完成！"
