#!/bin/bash
# AI Prompt Hub - 一键更新脚本（在 ECS 上运行）
# 用法: bash update.sh

set -e

cd ~/ai-prompt-hub

echo "=== 1/4 拉取最新代码 ==="
# fetch + reset 兼容强制推送（历史清理）后的部署；.env/uploads/数据库为未跟踪文件不受影响
git fetch origin
git reset --hard origin/main

echo "=== 2/4 安装新依赖（如有） ==="
pnpm install

echo "=== 3/4 构建 ==="
pnpm build:server
pnpm build:web

echo "=== 4/4 部署 nginx 配置并重启服务 ==="
sudo cp ~/ai-prompt-hub/nginx/ecs-default.conf /etc/nginx/sites-available/default
pm2 restart aph-server --silent
sudo systemctl restart nginx

echo ""
echo "✅ 更新完成！"
echo "   网站: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
