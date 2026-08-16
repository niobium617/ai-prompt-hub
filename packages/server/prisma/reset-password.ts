/**
 * 一次性运维脚本：重置指定邮箱用户的密码（在 ECS 服务器上执行）
 *
 * 用法（先加载 .env）:
 *   cd ~/ai-prompt-hub/packages/server
 *   set -a && . ./.env && set +a
 *   npx ts-node prisma/reset-password.ts <email> <newPassword≥12位>
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const pwd = process.argv[3];
  if (!email || !pwd || pwd.length < 12) {
    throw new Error('用法: npx ts-node prisma/reset-password.ts <email> <newPassword≥12位>');
  }
  const passwordHash = await bcrypt.hash(pwd, 12);
  const user = await prisma.user.update({ where: { email }, data: { passwordHash } });
  console.log(`✅ 已重置密码: id=${user.id} email=${user.email}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
