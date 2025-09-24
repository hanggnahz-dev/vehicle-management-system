# 404页面问题解决方案

## 问题描述

部署成功后，访问网站显示404页面，这通常是由以下原因造成的：

1. **前端文件未构建** - 缺少 `frontend/dist` 目录
2. **Nginx配置错误** - 静态文件路径配置不正确
3. **文件权限问题** - nginx用户无法读取前端文件
4. **服务未启动** - Nginx或后端服务未正常运行

## 快速解决方案

### 方法1: 使用自动修复脚本

```bash
# 在服务器上运行
sudo /opt/vehicle-management/fix-404.sh
```

### 方法2: 手动修复步骤

#### 步骤1: 重新构建前端

```bash
cd /opt/vehicle-management/frontend
rm -rf dist/
npm install
npm run build
```

#### 步骤2: 修复文件权限

```bash
chmod -R 755 /opt/vehicle-management/frontend/dist
chown -R nginx:nginx /opt/vehicle-management/frontend/dist
```

#### 步骤3: 重启Nginx

```bash
nginx -t
systemctl reload nginx
```

#### 步骤4: 检查服务状态

```bash
systemctl status nginx
systemctl status vehicle-backend
```

## 诊断工具

### 运行完整诊断

```bash
sudo /opt/vehicle-management/diagnose-404.sh
```

### 手动检查项目

```bash
# 检查前端文件
ls -la /opt/vehicle-management/frontend/dist/

# 检查Nginx配置
nginx -t
cat /etc/nginx/conf.d/vehicle-management.conf

# 检查服务状态
systemctl status nginx
systemctl status vehicle-backend

# 检查端口占用
netstat -tlnp | grep -E ':(80|5000)'

# 检查日志
tail -20 /var/log/nginx/error.log
journalctl -u vehicle-backend -n 20
```

## 常见问题及解决方案

### 问题1: 前端构建失败

**症状**: `npm run build` 失败

**解决方案**:
```bash
cd /opt/vehicle-management/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题2: Nginx配置错误

**症状**: `nginx -t` 失败

**解决方案**:
```bash
# 检查配置文件语法
nginx -t

# 如果配置错误，重新生成配置
sudo /opt/vehicle-management/deploy-aliyun-alinux3.sh
```

### 问题3: 文件权限问题

**症状**: nginx无法读取前端文件

**解决方案**:
```bash
chmod -R 755 /opt/vehicle-management/frontend/dist
chown -R nginx:nginx /opt/vehicle-management/frontend/dist
```

### 问题4: 后端服务未启动

**症状**: API请求失败

**解决方案**:
```bash
systemctl start vehicle-backend
systemctl enable vehicle-backend
```

### 问题5: 端口被占用

**症状**: 服务启动失败

**解决方案**:
```bash
# 检查端口占用
netstat -tlnp | grep -E ':(80|5000)'

# 杀死占用进程
sudo kill -9 <PID>

# 重启服务
systemctl restart nginx
systemctl restart vehicle-backend
```

## 验证修复结果

### 测试前端访问

```bash
curl -I http://localhost/
# 应该返回 200 OK
```

### 测试后端API

```bash
curl http://localhost/api/vehicles
# 应该返回JSON数据
```

### 测试健康检查

```bash
curl http://localhost/health
# 应该返回 {"status":"ok"}
```

## 预防措施

1. **确保前端构建** - 部署脚本会自动构建前端
2. **检查文件权限** - 确保nginx用户可以读取文件
3. **验证Nginx配置** - 使用 `nginx -t` 检查配置
4. **监控服务状态** - 定期检查服务运行状态
5. **查看日志** - 定期检查错误日志

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 运行诊断脚本的输出
2. Nginx错误日志
3. 后端服务日志
4. 系统服务状态

```bash
# 收集诊断信息
sudo /opt/vehicle-management/diagnose-404.sh > diagnosis.log 2>&1
```
