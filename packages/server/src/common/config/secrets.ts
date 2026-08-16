/**
 * 读取密钥环境变量
 * - 生产环境缺失时直接抛错（拒绝弱密钥运行）
 * - 开发环境缺失时使用可预测的 dev 占位值
 */
export function getSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`缺少必需的环境变量: ${name}，请检查 .env 配置`);
    }
    return `dev-${name.toLowerCase().replace(/_/g, '-')}`;
  }
  return value;
}
