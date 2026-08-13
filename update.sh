#!/bin/bash
# AI Prompt Hub - 一键更新脚本（在 ECS 上运行）
# 用法: bash update.sh

set -e

cd ~/ai-prompt-hub

echo "=== 1/4 拉取最新代码 ==="
git pull

echo "=== 2/4 安装新依赖（如有） ==="
pnpm install

echo "=== 3/4 构建 ==="
pnpm build:server
pnpm build:web

echo "=== 4/4 重启服务 ==="
pm2 restart aph-server --silent
sudo systemctl restart nginx

echo ""
echo "✅ 更新完成！"
echo "   网站: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
