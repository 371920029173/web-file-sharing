#!/usr/bin/env node

/**
 * Vercel部署检查脚本
 * 用于验证环境变量和配置是否正确
 */

console.log('🔍 检查Vercel部署配置...\n');

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ 缺少环境变量: ${varName}`);
  } else {
    console.log(`✅ 环境变量已设置: ${varName}`);
  }
});

if (missingVars.length > 0) {
  console.log('\n🚨 部署前需要设置以下环境变量:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n请在Vercel Dashboard中添加这些环境变量');
  process.exit(1);
}

// 检查Supabase URL格式
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.log('\n⚠️  警告: Supabase URL格式可能不正确');
  console.log(`   当前值: ${supabaseUrl}`);
  console.log('   应该是: https://xxx.supabase.co 格式');
}

// 检查应用URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl && appUrl.includes('localhost')) {
  console.log('\n⚠️  警告: 生产环境不应使用localhost');
  console.log(`   当前值: ${appUrl}`);
  console.log('   应该设置为你的Vercel域名');
}

console.log('\n✅ 环境变量检查完成！');
console.log('\n📋 部署步骤:');
console.log('1. 推送代码到GitHub');
console.log('2. 在Vercel中导入项目');
console.log('3. 添加环境变量');
console.log('4. 部署');
console.log('\n🚀 准备就绪，可以部署了！'); 