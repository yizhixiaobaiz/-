# 功能测试指南

## 测试环境准备

1. 先确认依赖已安装：
   - 前端：`npm install` (根目录)
   - 后端：`cd server && npm install`

2. 创建示例技能包：
   - 将 `test-skill-1.json` 和 `test-skill-2.json` 压缩为 `skills.zip`

## 前端功能测试

### 1. 导入按钮检查
- [ ] 打开 AI 助手页面
- [ ] 点击 "技能管理"
- [ ] 确认看到 "📦 导入skill.zip技能包" 按钮

### 2. 文件上传测试
- [ ] 点击导入按钮，选择非 ZIP 文件 → 应提示格式错误
- [ ] 选择超过 10MB 的文件 → 应提示大小超限
- [ ] 选择测试用的 skills.zip → 应成功导入

### 3. 技能管理测试
- [ ] 导入后检查技能列表是否包含新技能
- [ ] 测试编辑技能功能
- [ ] 测试删除技能功能
- [ ] 测试添加新技能功能

## 后端 API 测试

### 1. 健康检查
```
GET /api/health
```

### 2. 技能 API
需要认证 Token 才能测试：

```
POST /api/skills/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
Body: skillPackage=<file>
```

```
GET /api/skills/user
Authorization: Bearer <token>
```

```
PUT /api/skills/:skillId
Authorization: Bearer <token>
Content-Type: application/json
```

```
DELETE /api/skills/:skillId
Authorization: Bearer <token>
```

## 数据库验证

检查以下表是否正确创建：
- skill_packages
- user_skills
