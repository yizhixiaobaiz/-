# 个人记账应用 (Expense Tracker) 项目介绍

## 项目概述

这是一个基于前后端分离架构的个人记账应用，用于管理个人收支记录、分类管理和数据统计分析。应用采用现代化的技术栈，支持Docker容器化部署，并集成了HTTPS安全访问。

### 核心功能

- **用户认证**：注册/登录功能、JWT令牌认证、密码加密存储
- **交易记录管理**：添加、编辑、删除交易记录，支持收入和支出两种类型
- **分类管理**：系统默认分类、自定义分类、分类与用户关联
- **数据导入导出**：Excel格式导入导出、数据备份与恢复
- **统计分析**：收支趋势分析、分类占比分析、数据可视化图表

## 技术架构

### 前端技术栈

- **框架**：Vue 3
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router
- **图表库**：ECharts
- **其他工具**：xlsx（Excel导入导出）、crypto-js（加密）

### 后端技术栈

- **运行环境**：Node.js
- **Web框架**：Express
- **数据库**：MySQL
- **认证**：JWT
- **其他工具**：bcryptjs（密码加密）、dotenv（环境变量）

### 部署技术

- **容器化**：Docker
- **反向代理**：Nginx
- **HTTPS支持**：自签SSL证书

## 项目结构

### 前端结构 (`src/`)

```
src/
├── components/         # 组件目录
│   └── business/       # 业务组件
│       ├── AddTransaction.vue    # 添加交易
│       ├── EditTransaction.vue   # 编辑交易
│       ├── ImportExport.vue      # 导入导出
│       ├── Login.vue             # 登录组件
│       └── RecordList.vue        # 记录列表
├── router/             # 路由配置
│   └── index.js
├── store/              # Pinia 状态管理
│   ├── modules/
│   │   └── transaction.js
│   └── index.js
├── stores/             # 备用状态管理
│   ├── auth.js         # 认证状态
│   └── record.js       # 记录状态
├── utils/              # 工具函数
│   ├── api.js          # API 调用
│   ├── recordStore.js  # 记录存储
│   └── storage.js      # 本地存储
├── views/              # 页面视图
│   ├── Home/           # 首页
│   ├── Login/          # 登录页
│   ├── Records/        # 记录页
│   ├── Settings/       # 设置页
│   └── Statistics/     # 统计页
├── App.vue             # 根组件
└── main.js             # 入口文件
```

### 后端结构 (`server/`)

```
server/
├── config/             # 配置文件
│   └── database.js     # 数据库配置
├── database/           # 数据库初始化
│   └── init.sql        # 数据库初始化脚本
├── middleware/         # 中间件
│   └── auth.js         # 认证中间件
├── routes/             # 路由
│   ├── auth.js         # 认证路由
│   ├── categories.js   # 分类路由
│   └── records.js      # 记录路由
├── Dockerfile          # 后端 Docker 配置
├── package.json        # 后端依赖
└── server.js           # 后端入口
```

### 配置文件

- **`docker-compose.yml`**：Docker服务配置
- **`nginx.conf`**：Nginx反向代理配置
- **`ssl/`**：SSL证书文件

## 环境配置

### 1. 系统要求

- **Docker**：版本 20.0+
- **Docker Compose**：版本 1.29+
- **Node.js**（仅本地开发）：版本 14.0+
- **Git**：版本 2.0+

### 2. 网络配置

- **前端服务**：
  - HTTP端口：80
  - HTTPS端口：443
- **后端API服务**：
  - 端口：3000
- **数据库服务**：
  - 端口：3306（容器内部）

### 3. 环境变量

后端服务使用以下环境变量：
- `NODE_ENV`：运行环境（production/development）
- `DB_HOST`：数据库主机
- `DB_USER`：数据库用户名
- `DB_PASSWORD`：数据库密码
- `DB_NAME`：数据库名称
- `JWT_SECRET`：JWT密钥

## 启动方式



### 方式一：Docker Compose 启动（推荐）

#### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd <项目目录>
```

#### 2. 启动服务
##第一次启动使用清使用 


```bash
docker-compose up -d 或者 ./qd.sh （推荐自动帮忙创建证书，启动服务）
```

此命令会：
- 构建前端和后端镜像
- 启动三个容器：
  - `web`：前端服务（Nginx），监听 80 和 443 端口
  - `api`：后端API服务，监听 3000 端口
  - `mysql`：MySQL数据库服务

#### 3. 访问方式
- **前端应用**：
  - HTTP：`http://localhost`
  - HTTPS：`https://localhost`（浏览器会显示安全警告，点击"高级" -> "继续访问"）
- **后端API**：`http://localhost:3000/api`

#### 4. 停止服务
```bash
docker-compose down
```

### 方式二：本地开发模式

#### 前端开发
1. **安装依赖**：
   ```bash
   npm install
   ```
2. **启动开发服务器**：
   ```bash
   npm run dev
   ```
3. **访问**：`http://localhost:5173`

#### 后端开发
1. **进入后端目录**：
   ```bash
   cd server
   ```
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **启动开发服务器**：
   ```bash
   npm run dev
   ```
4. **API地址**：`http://localhost:3000/api`

## 数据库结构

### 1. users 表
- **id**：用户ID（主键）
- **username**：用户名（唯一）
- **password**：密码（加密存储）
- **created_at**：创建时间
- **updated_at**：更新时间

### 2. categories 表
- **id**：分类ID（主键）
- **user_id**：用户ID（外键）
- **name**：分类名称
- **type**：类型（income/expense）
- **created_at**：创建时间
- **updated_at**：更新时间

### 3. records 表
- **id**：记录ID（主键）
- **user_id**：用户ID（外键）
- **type**：类型（income/expense）
- **category**：分类
- **amount**：金额
- **date**：日期
- **datetime**：时间
- **note**：备注
- **created_at**：创建时间
- **updated_at**：更新时间

## 部署注意事项

1. **SSL证书**：
   - 项目使用自签SSL证书，仅用于开发和测试环境
   - 生产环境建议使用受信任的CA证书

2. **端口冲突**：
   - 若端口冲突，可修改 `docker-compose.yml` 中的端口映射
   - 例如：将 `80:80` 改为 `8080:80`

3. **数据备份**：
   - 定期备份数据库数据，避免数据丢失
   - 数据库数据存储在 `mysql-data` 卷中

4. **性能优化**：
   - 生产环境建议增加服务器资源
   - 可根据实际用户量调整容器资源限制

5. **安全配置**：
   - 修改默认的数据库密码和JWT密钥
   - 配置防火墙规则，限制外部访问

## 项目特点

1. **前后端分离**：清晰的职责划分，便于维护和扩展
2. **容器化部署**：简化部署流程，提高环境一致性
3. **数据安全**：密码加密、JWT认证、HTTPS传输
4. **用户体验**：响应式设计、友好的UI、流畅的交互
5. **功能完整**：从基础记账到高级统计分析，满足个人记账需求
6. **可扩展性**：模块化设计，便于添加新功能

