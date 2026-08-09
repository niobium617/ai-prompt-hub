# AI Prompt Hub 🚀

AI提示词社区分享平台 — 集提示词库、AI技能教程、在线工具、社区交流于一体的综合性平台。

## 技术栈

| 层级 | 技术 |
|------|------|
| **Web前端** | Vue 3 + TypeScript + Element Plus + TailwindCSS |
| **小程序** | 微信原生小程序 + TypeScript + Vant Weapp |
| **后端** | NestJS + TypeScript + Prisma + MySQL |
| **基础设施** | Docker Compose + Redis + Elasticsearch + Nginx |

## 项目结构

```
ai-prompt-hub/
├── packages/
│   ├── shared/          # 共享类型和常量
│   ├── server/          # NestJS 后端
│   └── web/             # Vue 3 前端
├── miniprogram/         # 微信小程序
├── nginx/               # Nginx 配置
├── docker-compose.yml   # Docker 编排
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### 2. 启动基础设施

```bash
# 启动 MySQL + Redis + Elasticsearch
docker compose up -d
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 数据库初始化

```bash
# 复制环境变量
cp .env.example packages/server/.env

# 运行数据库迁移
pnpm db:migrate

# 初始化种子数据
pnpm db:seed
```

### 5. 启动开发服务

```bash
# 启动后端 (http://localhost:3000)
pnpm dev:server

# 启动前端 (http://localhost:5173)
pnpm dev:web
```

### 6. 访问

- 前端: http://localhost:5173
- API 文档: http://localhost:3000/api/docs
- Prisma Studio: `pnpm db:studio`

### 默认管理员账号

- 邮箱: admin@prompt-hub.local
- 密码: REMOVED-SECRET

## 部署到阿里云服务器

```bash
# 1. 构建前端
pnpm build:web

# 2. 构建后端
pnpm build:server

# 3. 使用 docker compose 部署
docker compose -f docker-compose.prod.yml up -d
```

## License

MIT
