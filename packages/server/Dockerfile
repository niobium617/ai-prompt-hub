# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源码并构建
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/
RUN pnpm build

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma/

# 替换为 MySQL schema 并生成 Prisma Client
RUN cp /app/prisma/schema.mysql.prisma /app/prisma/schema.prisma && cd /app && npx prisma generate

EXPOSE 3000

# 运行迁移 + 启动服务
CMD sh -c "npx prisma db push --skip-generate 2>/dev/null; node dist/main"
