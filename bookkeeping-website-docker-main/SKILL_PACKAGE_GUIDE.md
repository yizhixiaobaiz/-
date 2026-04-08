# 技能包导入指南

## 概述
本指南介绍如何创建和导入 skill.zip 技能包文件，以便批量添加技能到系统中。

## 技能包格式要求

### 文件结构
技能包必须是一个 .zip 格式的压缩文件，包含以下内容：
- 一个或多个 JSON 格式的技能文件
- 每个技能文件包含一个完整的技能定义

### 技能文件示例
每个技能文件必须是有效的 JSON 文件，包含以下字段：

```json
{
  "name": "查询天气",
  "description": "查询指定城市的天气信息",
  "keywords": ["天气", "气温", "下雨", "晴天", "预报"],
  "code": "const match = message.match(/(北京|上海|广州|深圳|杭州|成都|武汉|西安|海南)/); const city = match ? match[0] : \"未知城市\"; return \"今天\" + city + \"的天气晴朗，气温25℃，适合外出活动。\""
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 技能名称，用于显示 |
| description | string | 是 | 技能描述，说明技能功能 |
| keywords | array | 是 | 关键词数组，用于AI识别用户意图 |
| code | string | 是 | JavaScript 代码，实现技能逻辑 |

### 代码编写规范
技能代码是一个 JavaScript 片段，执行时可访问以下变量：
- `message`: 用户输入的原始消息
- `console`: 标准控制台对象

代码必须返回一个字符串作为技能执行结果。

### 示例技能包
创建技能包的步骤：
1. 为每个技能创建一个单独的 JSON 文件
2. 将所有 JSON 文件压缩成一个 .zip 文件
3. 在系统中导入该 .zip 文件

## 限制说明
- 文件大小限制：最大 10MB
- 仅支持 .zip 格式文件
- 每个技能文件必须是有效的 JSON 格式
- 技能代码需要安全的 JavaScript 执行环境

## API 文档

### 上传技能包
**端点**: `POST /api/skills/upload`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**:
- `skillPackage`: 文件，zip 格式的技能包

**响应示例**:
```json
{
  "success": true,
  "message": "Successfully imported 3 skills",
  "data": {
    "packageId": "1234567890123",
    "skillsImported": 3
  }
}
```

### 获取用户技能
**端点**: `GET /api/skills/user`

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "skill123",
      "user_id": "user456",
      "package_id": "pkg789",
      "name": "查询天气",
      "description": "查询指定城市的天气信息",
      "keywords": ["天气", "气温", "下雨"],
      "code": "...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 删除技能
**端点**: `DELETE /api/skills/:skillId`

**请求头**:
```
Authorization: Bearer <token>
```

### 更新技能
**端点**: `PUT /api/skills/:skillId`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "name": "查询天气",
  "description": "查询指定城市的天气信息",
  "keywords": ["天气", "气温"],
  "code": "..."
}
```

## 数据库架构

### skill_packages 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(64) | 主键 |
| user_id | VARCHAR(64) | 用户 ID，外键 |
| name | VARCHAR(100) | 技能包名称 |
| version | VARCHAR(20) | 版本号 |
| description | TEXT | 描述 |
| author | VARCHAR(100) | 作者 |
| status | ENUM | 状态 (pending/processed/failed) |
| file_path | VARCHAR(255) | 文件存储路径 |
| extracted_skills | JSON | 提取的技能元数据 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### user_skills 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(64) | 主键 |
| user_id | VARCHAR(64) | 用户 ID，外键 |
| package_id | VARCHAR(64) | 技能包 ID，外键 |
| name | VARCHAR(100) | 技能名称 |
| description | TEXT | 描述 |
| keywords | JSON | 关键词数组 |
| code | TEXT | 技能代码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
