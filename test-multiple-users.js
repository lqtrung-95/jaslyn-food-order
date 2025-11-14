#!/usr/bin/env node

/**
 * 测试多用户 Telegram 通知功能
 * 使用方法：node test-multiple-users.js
 */

require('dotenv').config();

// 模拟多用户配置测试
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;

if (!TELEGRAM_USER_ID) {
  console.log('❌ 未配置 TELEGRAM_USER_ID 环境变量');
  process.exit(1);
}

console.log('🔧 测试多用户配置解析...');
console.log(`原始配置: ${TELEGRAM_USER_ID}`);

// 解析用户ID列表
const TELEGRAM_USER_IDS = TELEGRAM_USER_ID.split(',').map(id => id.trim());
console.log(`解析后的用户ID列表: ${JSON.stringify(TELEGRAM_USER_IDS)}`);
console.log(`用户数量: ${TELEGRAM_USER_IDS.length}`);

// 验证每个ID格式
TELEGRAM_USER_IDS.forEach((userId, index) => {
  if (!/^\d+$/.test(userId)) {
    console.log(`⚠️  用户ID ${index + 1} 格式可能有误: ${userId}`);
  } else {
    console.log(`✅ 用户ID ${index + 1}: ${userId} - 格式正确`);
  }
});

console.log('\n📝 配置建议:');
console.log('- 单个用户: TELEGRAM_USER_ID=123456789');
console.log('- 多个用户: TELEGRAM_USER_ID=123456789,987654321,555555555');
console.log('- 确保用户ID之间用逗号分隔，不要有额外空格');

console.log('\n✅ 多用户配置测试完成！');