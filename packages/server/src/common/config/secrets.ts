/**
 * 读取密钥环境变量
 * - 生产环境缺失或为占位值时直接抛错（拒绝弱密钥运行）
 * - 开发环境缺失时使用可预测的 dev 占位值
 */
export function getSecret(name: string): string {
  const value = process.env[name];
  // 占位值（.env.example 复制来的）视同缺失；"your-" 前缀与 "change" 开头的占位值一律拒绝
  if (!value || /^(your-|change|placeholder|example)/i.test(value)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`环境变量 ${name} 缺失或为占位值，拒绝启动，请检查 .env 配置`);
    }
    return `dev-${name.toLowerCase().replace(/_/g, '-')}`;
  }
  return value;
}
