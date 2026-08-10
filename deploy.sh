#!/bin/bash
# AI Prompt Hub - 一键部署脚本（在阿里云 ECS 上运行）

set -e

echo "============================================"
echo "  AI Prompt Hub 生产部署"
echo "============================================"

# 1. 检查环境
echo "[1/5] 检查环境..."
command -v docker >/dev/null 2>&1 || { echo "请先安装 Docker: curl -fsSL https://get.docker.com | sh"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "请先安装 Docker Compose"; exit 1; }
echo "✅ Docker 已就绪"

# 2. 创建 .env 文件
echo "[2/5] 配置环境变量..."
if [ ! -f .env ]; then
  cp .env.example .env
  # 生成随机密钥
  ACCESS_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | head -c 32 | xxd -p)
  REFRESH_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | head -c 32 | xxd -p)
  DB_PASSWORD=$(openssl rand -hex 8 2>/dev/null || cat /dev/urandom | head -c 8 | xxd -p)

  cat > .env << EOF
DB_ROOT_PASSWORD=${DB_PASSWORD}
JWT_ACCESS_SECRET=${ACCESS_SECRET}
JWT_REFRESH_SECRET=${REFRESH_SECRET}
LLM_API_KEY=your-api-key
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
EOF
  echo "✅ .env 已生成（含随机密钥）"
else
  echo "✅ .env 已存在"
fi

# 3. 构建前端
echo "[3/5] 构建前端..."
cd packages/web
npm install -g pnpm 2>/dev/null || true
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm build
cd ../..
echo "✅ 前端构建完成"

# 4. 构建并启动 Docker 服务
echo "[4/5] 启动 Docker 服务..."
docker compose -f docker-compose.prod.yml up -d --build
echo "✅ Docker 服务已启动"

# 5. 等待服务就绪
echo "[5/5] 等待服务就绪..."
sleep 5
for i in 1 2 3 4 5; do
  if curl -s http://localhost:3000/api/v1/categories >/dev/null 2>&1; then
    echo "✅ 后端 API 就绪"
    break
  fi
  echo "  等待中... ($i/5)"
  sleep 5
done

echo ""
echo "============================================"
echo "  部署完成！"
echo "  Web:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
echo "  API:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')/api/v1"
echo "============================================"
