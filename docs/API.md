# API 文档

## 概述

本文档描述了 Fullstack 应用的 RESTful API 接口。

## 基础信息

- **基础 URL**: `http://localhost:5000/api`
- **内容类型**: `application/json`
- **认证方式**: JWT Bearer Token

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息"
}
```

## 用户接口

### 获取用户列表

**GET** `/users`

获取所有用户列表。

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "获取用户列表成功"
}
```

### 获取用户详情

**GET** `/users/:id`

根据用户 ID 获取用户详情。

#### 路径参数

| 参数 | 类型   | 必需 | 描述    |
| ---- | ------ | ---- | ------- |
| id   | number | 是   | 用户 ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "获取用户信息成功"
}
```

### 获取当前用户

**GET** `/users/me`

获取当前登录用户的信息。

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "获取当前用户信息成功"
}
```

### 创建用户

**POST** `/users`

创建新用户。

#### 请求体

```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "123456",
  "status": "active"
}
```

#### 字段说明

| 字段     | 类型   | 必需 | 描述                                  |
| -------- | ------ | ---- | ------------------------------------- |
| name     | string | 是   | 用户名，2-50 个字符                   |
| email    | string | 是   | 邮箱地址，必须唯一                    |
| password | string | 是   | 密码，至少 6 个字符                   |
| status   | string | 否   | 状态，active 或 inactive，默认 active |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "张三",
    "email": "zhangsan@example.com",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "用户创建成功"
}
```

### 更新用户

**PUT** `/users/:id`

更新指定用户的信息。

#### 路径参数

| 参数 | 类型   | 必需 | 描述    |
| ---- | ------ | ---- | ------- |
| id   | number | 是   | 用户 ID |

#### 请求体

```json
{
  "name": "张三（更新）",
  "email": "zhangsan_new@example.com",
  "status": "inactive"
}
```

#### 字段说明

| 字段     | 类型   | 必需 | 描述                     |
| -------- | ------ | ---- | ------------------------ |
| name     | string | 否   | 用户名，2-50 个字符      |
| email    | string | 否   | 邮箱地址，必须唯一       |
| password | string | 否   | 密码，至少 6 个字符      |
| status   | string | 否   | 状态，active 或 inactive |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三（更新）",
    "email": "zhangsan_new@example.com",
    "status": "inactive",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "用户更新成功"
}
```

### 删除用户

**DELETE** `/users/:id`

删除指定用户。

#### 路径参数

| 参数 | 类型   | 必需 | 描述    |
| ---- | ------ | ---- | ------- |
| id   | number | 是   | 用户 ID |

#### 响应示例

```json
{
  "success": true,
  "message": "用户删除成功"
}
```

## 错误码

| 状态码 | 描述           |
| ------ | -------------- |
| 200    | 请求成功       |
| 201    | 创建成功       |
| 400    | 请求参数错误   |
| 401    | 未授权         |
| 403    | 禁止访问       |
| 404    | 资源不存在     |
| 409    | 资源冲突       |
| 429    | 请求过于频繁   |
| 500    | 服务器内部错误 |

## 使用示例

### JavaScript (Axios)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 获取用户列表
const getUsers = async () => {
  try {
    const response = await api.get("/users");
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

// 创建用户
const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

### cURL

```bash
# 获取用户列表
curl -X GET http://localhost:5000/api/users

# 创建用户
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "password": "123456"
  }'

# 更新用户
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三（更新）",
    "status": "inactive"
  }'

# 删除用户
curl -X DELETE http://localhost:5000/api/users/1
```

## 注意事项

1. 所有时间字段都使用 ISO 8601 格式
2. 密码字段在响应中会被隐藏
3. 邮箱地址必须唯一
4. 所有字符串字段都支持 UTF-8 编码
5. 建议在生产环境中使用 HTTPS

## 车辆管理接口

### 获取车辆列表

**GET** `/vehicles`

获取车辆列表，支持筛选参数。

#### 查询参数

| 参数                 | 类型   | 必需 | 描述                            |
| -------------------- | ------ | ---- | ------------------------------- |
| company_name         | string | 否   | 公司名称（模糊匹配）            |
| license_plate        | string | 否   | 车牌号（模糊匹配）              |
| inspection_date_from | string | 否   | 审证日期开始                    |
| inspection_date_to   | string | 否   | 审证日期结束                    |
| status               | string | 否   | 状态（active/inactive/expired） |

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_name": "北京运输有限公司",
      "license_plate": "京A12345",
      "inspection_date": "2024-12-31",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "获取车辆列表成功"
}
```

### 创建车辆

**POST** `/vehicles`

创建新的车辆记录。

#### 请求体

```json
{
  "company_name": "北京运输有限公司",
  "license_plate": "京A12345",
  "inspection_date": "2024-12-31",
  "status": "active"
}
```

## 角色管理接口

### 获取角色列表

**GET** `/roles`

获取所有角色列表。

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "系统管理员",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "获取角色列表成功"
}
```
