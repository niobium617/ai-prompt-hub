#!/bin/bash
# AI Prompt Hub - 回滚脚本（在 ECS 上运行）
# 用法:
#   bash rollback.sh              → 回滚到上一个版本（HEAD~1）
#   bash rollback.sh <commit>     → 回滚到指定提交

set -e

cd ~/ai-prompt-hub

# 保存当前版本号
CURRENT=$(git rev-parse --short HEAD)

# 目标版本
if [ -n "$1" ]; then
  TARGET=$1
else
  TARGET="HEAD~1"
fi

echo "=== 当前版本: $CURRENT → 回滚到: $TARGET ==="
echo ""
echo "确认回滚？(y/n)"
read -r CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "已取消"
  exit 0
fi

# 1. 备份数据库和上传文件
echo "[1/4] 备份数据库..."
mkdir -p ~/backups
cp packages/server/prisma/dev.db ~/backups/dev.db.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp -r packages/server/uploads ~/backups/uploads.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 2. 回滚代码
echo "[2/4] 回滚代码..."
git checkout $TARGET -- .

# 3. 重新构建
echo "[3/4] 重新构建..."
pnpm build:server
pnpm build:web

# 4. 重启服务
echo "[4/4] 重启服务..."
pm2 restart aph-server --silent
sudo systemctl restart nginx

echo ""
echo "✅ 已回滚到: $(git rev-parse --short HEAD)"
echo "   如需回到最新版本: cd ~/ai-prompt-hub && git checkout main && bash update.sh"
