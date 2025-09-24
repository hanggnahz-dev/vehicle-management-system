#!/bin/bash

# GitHub上传脚本
# 使用方法: ./upload-to-github.sh <your-github-username> <repository-name>

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

# 检查参数
if [ $# -ne 2 ]; then
    echo "使用方法: $0 <your-github-username> <repository-name>"
    echo ""
    echo "示例:"
    echo "  $0 zhangsan vehicle-management-system"
    echo ""
    echo "请确保："
    echo "1. 已经在GitHub上创建了仓库"
    echo "2. 仓库名称与参数一致"
    echo "3. 已配置Git用户信息"
    exit 1
fi

GITHUB_USERNAME=$1
REPOSITORY_NAME=$2
REPOSITORY_URL="https://github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}.git"

log_info "准备上传到GitHub仓库: $REPOSITORY_URL"

# 检查Git配置
log_info "检查Git配置..."
if ! git config user.name > /dev/null 2>&1; then
    log_warning "Git用户名未配置，请先配置："
    echo "git config --global user.name 'Your Name'"
    echo "git config --global user.email 'your.email@example.com'"
    exit 1
fi

if ! git config user.email > /dev/null 2>&1; then
    log_warning "Git邮箱未配置，请先配置："
    echo "git config --global user.email 'your.email@example.com'"
    exit 1
fi

log_success "Git配置检查通过"

# 添加远程仓库
log_info "添加远程仓库..."
if git remote get-url origin > /dev/null 2>&1; then
    log_warning "远程仓库已存在，更新URL..."
    git remote set-url origin $REPOSITORY_URL
else
    git remote add origin $REPOSITORY_URL
fi

log_success "远程仓库配置完成"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_warning "检测到未提交的更改，正在提交..."
    git add .
    git commit -m "Update: Latest changes before GitHub upload"
fi

# 推送到GitHub
log_info "推送到GitHub..."
git push -u origin main

log_success "代码已成功上传到GitHub！"
echo ""
echo "=========================================="
echo "           上传完成"
echo "=========================================="
echo "仓库地址: $REPOSITORY_URL"
echo "克隆命令: git clone $REPOSITORY_URL"
echo ""
echo "下一步："
echo "1. 访问仓库页面查看代码"
echo "2. 更新README.md中的仓库链接"
echo "3. 配置GitHub Pages（如需要）"
echo "4. 设置仓库描述和标签"
echo "=========================================="
