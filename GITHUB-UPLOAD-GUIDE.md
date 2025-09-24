# GitHub上传指南

## 概述

本指南将帮助您将车辆管理系统代码上传到GitHub仓库。

## 准备工作

### 1. 创建GitHub账户
- 访问 https://github.com
- 注册新账户或登录现有账户

### 2. 配置Git用户信息
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. 配置SSH密钥（推荐）
```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 添加SSH密钥到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥到剪贴板
cat ~/.ssh/id_ed25519.pub
```

然后将公钥添加到GitHub账户：
1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥内容
4. 点击 "Add SSH key"

## 上传方法

### 方法一：使用上传脚本（推荐）

1. **在GitHub上创建新仓库**：
   - 访问 https://github.com/new
   - 仓库名称：`vehicle-management-system`
   - 描述：`Full-stack vehicle management system with Vue 3, Node.js, and Aliyun deployment support`
   - 选择 Public 或 Private
   - **不要**勾选 "Add a README file"
   - 点击 "Create repository"

2. **运行上传脚本**：
   ```bash
   cd /Users/zhanghang/work/hax/fullstack-project
   ./upload-to-github.sh your-github-username vehicle-management-system
   ```

### 方法二：手动上传

1. **在GitHub上创建新仓库**（同上）

2. **添加远程仓库**：
   ```bash
   cd /Users/zhanghang/work/hax/fullstack-project
   git remote add origin https://github.com/your-username/vehicle-management-system.git
   ```

3. **推送到GitHub**：
   ```bash
   git push -u origin main
   ```

### 方法三：使用GitHub CLI

1. **安装GitHub CLI**：
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Windows
   winget install GitHub.cli
   ```

2. **登录GitHub**：
   ```bash
   gh auth login
   ```

3. **创建仓库并推送**：
   ```bash
   cd /Users/zhanghang/work/hax/fullstack-project
   gh repo create vehicle-management-system --public --source=. --remote=origin --push
   ```

## 仓库配置

### 1. 更新仓库描述
- 访问仓库页面
- 点击 "Settings" 标签
- 在 "About" 部分添加描述和标签

### 2. 设置仓库主题
建议标签：
- `vue3`
- `nodejs`
- `typescript`
- `sqlite`
- `docker`
- `aliyun`
- `vehicle-management`
- `fullstack`

### 3. 配置分支保护
- 访问 "Settings" > "Branches"
- 添加规则保护 `main` 分支
- 要求Pull Request审查

## 文档完善

### 1. 更新README.md
确保README.md包含：
- 项目简介
- 功能特性
- 技术栈
- 安装说明
- 部署指南
- 贡献指南

### 2. 添加许可证
- 点击 "Add file" > "Create new file"
- 文件名：`LICENSE`
- 选择适当的许可证（如MIT）

### 3. 添加贡献指南
- 创建 `CONTRIBUTING.md` 文件
- 说明如何贡献代码
- 设置代码规范

## 持续集成

### 1. GitHub Actions
创建 `.github/workflows/ci.yml`：
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
```

### 2. 代码质量检查
- 配置ESLint和Prettier
- 设置代码覆盖率检查
- 配置安全扫描

## 发布管理

### 1. 创建Release
- 访问 "Releases" 页面
- 点击 "Create a new release"
- 添加版本号和发布说明

### 2. 版本标签
```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
```

## 协作开发

### 1. 邀请协作者
- 访问 "Settings" > "Manage access"
- 点击 "Invite a collaborator"
- 输入用户名或邮箱

### 2. 设置Issue模板
创建 `.github/ISSUE_TEMPLATE/bug_report.md`：
```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## 部署集成

### 1. GitHub Pages
- 访问 "Settings" > "Pages"
- 选择 "Deploy from a branch"
- 选择 `main` 分支和 `/docs` 文件夹

### 2. 自动部署
配置GitHub Actions自动部署到阿里云ECS：
```yaml
name: Deploy to Aliyun ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to ECS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.ECS_HOST }}
        username: ${{ secrets.ECS_USERNAME }}
        key: ${{ secrets.ECS_SSH_KEY }}
        script: |
          cd /opt/vehicle-management
          git pull origin main
          systemctl restart vehicle-backend vehicle-frontend
```

## 监控和分析

### 1. 仓库统计
- 访问 "Insights" 页面
- 查看代码贡献统计
- 分析访问量数据

### 2. 依赖管理
- 配置Dependabot自动更新依赖
- 设置安全警报
- 定期检查漏洞

## 故障排除

### 1. 推送失败
```bash
# 检查远程仓库配置
git remote -v

# 重新设置远程仓库
git remote set-url origin https://github.com/username/repo.git

# 强制推送（谨慎使用）
git push -f origin main
```

### 2. 权限问题
- 检查SSH密钥配置
- 确认GitHub账户权限
- 验证仓库访问权限

### 3. 大文件问题
```bash
# 安装Git LFS
git lfs install

# 跟踪大文件
git lfs track "*.sqlite"
git lfs track "*.db"

# 提交LFS配置
git add .gitattributes
git commit -m "Add LFS tracking"
```

## 最佳实践

1. **提交信息规范**：
   - 使用清晰的提交信息
   - 遵循约定式提交规范
   - 避免无意义的提交

2. **分支管理**：
   - 使用功能分支开发
   - 定期合并到主分支
   - 保持分支历史清晰

3. **代码质量**：
   - 编写单元测试
   - 使用代码审查
   - 保持代码整洁

4. **文档维护**：
   - 及时更新README
   - 编写API文档
   - 记录变更日志

## 总结

通过以上步骤，您可以将车辆管理系统成功上传到GitHub，并建立完整的开源项目管理体系。这将有助于：

- 代码版本控制
- 团队协作开发
- 项目展示和推广
- 持续集成和部署
- 社区贡献和反馈

如有问题，请参考GitHub官方文档或联系技术支持。
